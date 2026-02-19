import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from "../../components/navbar/navbar";
import { NavbaraComponent } from "../../components/navbara/navbara";
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, NavbaraComponent, Footer],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  // Control de vista activa
  currentView = signal<'personales' | 'registro' | 'documentos'>('personales');

  // Datos de Usuario (Signals para binding reactivo)
  user: any = null;
  primer_nombre = signal('');
  segundo_nombre = signal('');
  primer_apellido = signal('');
  segundo_apellido = signal('');
  telefono = signal('');

  // Formulario de Documentos
  tiposDoc = signal<any[]>([]);
  id_tdocumento = signal('');
  numero_documento = signal('');
  lugar_expedicion = signal('');
  estado_doc = signal(1);

  // Lista de documentos del usuario
  documentos = signal<any[]>([]);

  // Notificaciones
  notificationText = signal('');
  notificationType = signal<'success' | 'error' | ''>('');

  ngOnInit() {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.user = JSON.parse(stored);
      // Poblar señales con datos del usuario
      this.primer_nombre.set(this.user.primer_nombre);
      this.segundo_nombre.set(this.user.segundo_nombre || '');
      this.primer_apellido.set(this.user.primer_apellido);
      this.segundo_apellido.set(this.user.segundo_apellido || '');
      this.telefono.set(this.user.telefono);

      this.cargarTiposDoc();
      this.cargarDocumentos();
    }
  }

  showNotification(text: string, type: 'success' | 'error') {
    this.notificationText.set(text);
    this.notificationType.set(type);
    setTimeout(() => {
      this.notificationText.set('');
      this.notificationType.set('');
    }, 3000);
  }

  async cargarTiposDoc() {
    const res = await fetch("https://inntech-backend.onrender.com/tipos_documento/get_tipos_documento");
    const data = await res.json();
    if (res.ok) this.tiposDoc.set(data.data);
  }

  async cargarDocumentos() {
    const res = await fetch("https://inntech-backend.onrender.com/documentos/get_documentos_completo");
    const data = await res.json();
    if (res.ok && this.user) {
      this.documentos.set(data.data.filter((d: any) => d.id_usuario === this.user.id_usuario));
    }
  }

  async actualizarUsuario() {
    const payload = {
      primer_nombre: this.primer_nombre(),
      segundo_nombre: this.segundo_nombre(),
      primer_apellido: this.primer_apellido(),
      segundo_apellido: this.segundo_apellido(),
      telefono: this.telefono()
    };

    try {
      const res = await fetch(`https://inntech-backend.onrender.com/usuarios/update_usuario/${this.user.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.showNotification("Datos actualizados correctamente", "success");
        const updatedUser = { ...this.user, ...payload };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        this.user = updatedUser;
      } else {
        this.showNotification("Error al actualizar", "error");
      }
    } catch (e) {
      this.showNotification("Error de conexión", "error");
    }
  }

  async crearDocumento() {
    if (!this.id_tdocumento() || !this.numero_documento() || !this.lugar_expedicion()) {
      this.showNotification("Campos obligatorios faltantes", "error");
      return;
    }

    const payload = {
      id_tdocumento: Number(this.id_tdocumento()),
      id_usuario: this.user.id_usuario,
      numero_documento: this.numero_documento(),
      lugar_expedicion: this.lugar_expedicion(),
      estado: this.estado_doc()
    };

    try {
      const res = await fetch("https://inntech-backend.onrender.com/documentos/create_documento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.showNotification("Documento registrado", "success");
        this.numero_documento.set('');
        this.lugar_expedicion.set('');
        this.cargarDocumentos();
      }
    } catch (e) {
      this.showNotification("Error de conexión", "error");
    }
  }
}
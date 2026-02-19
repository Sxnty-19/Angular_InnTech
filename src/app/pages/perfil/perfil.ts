import { Component, OnInit, signal, computed } from '@angular/core';
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

  // Datos del Usuario (Signals)
  user = signal<any>(null);
  primer_nombre = signal('');
  segundo_nombre = signal('');
  primer_apellido = signal('');
  segundo_apellido = signal('');
  telefono = signal('');

  // Formulario de Documento
  tiposDoc = signal<any[]>([]);
  id_tdocumento = signal('');
  numero_documento = signal('');
  lugar_expedicion = signal('');
  estado_doc = signal(1);

  // Lista de documentos existentes
  documentos = signal<any[]>([]);

  // Notificación
  notification = signal<{ text: string, type: 'success' | 'error' | '', show: boolean }>({
    text: '', type: '', show: false
  });

  private readonly API_BASE = 'https://inntech-backend.onrender.com';

  async ngOnInit() {
    const stored = localStorage.getItem("user");
    if (stored) {
      const userData = JSON.parse(stored);
      this.user.set(userData);
      
      // Mapear datos a signals individuales para el binding
      this.primer_nombre.set(userData.primer_nombre || '');
      this.segundo_nombre.set(userData.segundo_nombre || '');
      this.primer_apellido.set(userData.primer_apellido || '');
      this.segundo_apellido.set(userData.segundo_apellido || '');
      this.telefono.set(userData.telefono || '');

      await this.cargarTiposDoc();
      await this.cargarDocumentos();
    }
  }

  showNotification(text: string, type: 'success' | 'error') {
    this.notification.set({ text, type, show: true });
    setTimeout(() => {
      this.notification.update(n => ({ ...n, show: false }));
    }, 3000);
  }

  async cargarTiposDoc() {
    try {
      const res = await fetch(`${this.API_BASE}/tipos_documento/get_tipos_documento`);
      const data = await res.json();
      if (res.ok) this.tiposDoc.set(data.data);
    } catch (e) { console.error(e); }
  }

  async cargarDocumentos() {
    try {
      const res = await fetch(`${this.API_BASE}/documentos/get_documentos_completo`);
      const data = await res.json();
      if (res.ok && this.user()) {
        const filtrados = data.data.filter((d: any) => d.id_usuario === this.user().id_usuario);
        this.documentos.set(filtrados);
      }
    } catch (e) { console.error(e); }
  }

  async actualizarUsuario() {
    try {
      const payload = {
        primer_nombre: this.primer_nombre(),
        segundo_nombre: this.segundo_nombre(),
        primer_apellido: this.primer_apellido(),
        segundo_apellido: this.segundo_apellido(),
        telefono: this.telefono(),
      };

      const res = await fetch(`${this.API_BASE}/usuarios/update_usuario/${this.user().id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        this.showNotification(data.detail || "Error al actualizar", "error");
        return;
      }

      this.showNotification("Datos actualizados correctamente", "success");
      const updatedUser = { ...this.user(), ...payload };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      this.user.set(updatedUser);
    } catch (e) {
      this.showNotification("Error de conexión", "error");
    }
  }

  async crearDocumento() {
    if (!this.id_tdocumento() || !this.numero_documento() || !this.lugar_expedicion()) {
      this.showNotification("Campos obligatorios incompletos", "error");
      return;
    }

    try {
      const payload = {
        id_tdocumento: Number(this.id_tdocumento()),
        id_usuario: this.user().id_usuario,
        numero_documento: this.numero_documento(),
        lugar_expedicion: this.lugar_expedicion(),
        estado: this.estado_doc(),
      };

      const res = await fetch(`${this.API_BASE}/documentos/create_documento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        this.showNotification(data.detail || "Error al crear documento", "error");
        return;
      }

      this.showNotification("Documento registrado", "success");
      this.numero_documento.set('');
      this.lugar_expedicion.set('');
      await this.cargarDocumentos();
    } catch (e) {
      this.showNotification("Error de conexión", "error");
    }
  }
}
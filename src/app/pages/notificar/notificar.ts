import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from "../../components/footer/footer";
import { Navbar } from "../../components/navbar/navbar";
import { NavbaraComponent } from "../../components/navbara/navbara";

@Component({
  selector: 'app-notificar',
  standalone: true,
  imports: [CommonModule, FormsModule, Footer, Navbar, NavbaraComponent],
  templateUrl: './notificar.html',
  styleUrls: ['./notificar.css']
})
export class Notificar implements OnInit {
  private readonly API_URL = "https://inntech-backend.onrender.com/notificaciones";

  // Estado de Usuario
  user: any = null;

  // Estado de Vista y Formulario
  activeView = signal<'create' | 'history'>('create');
  numeroHabitacion = signal('');
  descripcion = signal('');
  isSubmitting = signal(false);
  error = signal('');

  // Historial
  notificaciones = signal<any[]>([]);

  // Sistema de Notificación Flotante (Toast)
  message = signal('');
  isSuccess = signal(false);
  showMessage = signal(false);
  isModalActive = signal(false);

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.cargarNotificaciones();
    }
  }

  // --- Manejo de Notificaciones Flotantes ---
  async showFloatingMessage(type: 'success' | 'error', text: string) {
    if (this.showMessage()) {
      this.isModalActive.set(false);
      await new Promise(r => setTimeout(r, 100));
    }

    this.message.set(text);
    this.isSuccess.set(type === 'success');
    this.showMessage.set(true);
    this.isModalActive.set(true);

    setTimeout(() => this.hideMessageWithTransition(), 4000);
  }

  hideMessageWithTransition() {
    this.isModalActive.set(false);
    setTimeout(() => this.showMessage.set(false), 300);
  }

  // --- Acciones de API ---
  async crearNotificacion() {
    if (!this.numeroHabitacion() || !this.descripcion()) {
      this.showFloatingMessage('error', 'Por favor, complete todos los campos.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    const formData = new FormData();
    formData.append("id_usuario", this.user.id_usuario);
    formData.append("numero_habitacion", this.numeroHabitacion());
    formData.append("descripcion", this.descripcion());
    formData.append("estado", "1");

    try {
      const res = await fetch(`${this.API_URL}/crear_por_numero`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        this.showFloatingMessage('success', `Solicitud creada para Habitación ${this.numeroHabitacion()}`);
        this.numeroHabitacion.set('');
        this.descripcion.set('');
        await this.cargarNotificaciones();
        this.activeView.set('history');
      } else {
        this.showFloatingMessage('error', data.detail ?? "Error al crear.");
      }
    } catch (e) {
      this.showFloatingMessage('error', "Error de conexión con el servidor.");
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async cargarNotificaciones() {
    if (!this.user) return;
    try {
      const res = await fetch(`${this.API_URL}/usuario/${this.user.id_usuario}`);
      const data = await res.json();
      if (res.ok) {
        const sorted = data.data.sort((a: any, b: any) => b.id_notificacion - a.id_notificacion);
        this.notificaciones.set(sorted);
      }
    } catch (e) {
      this.error.set("Error al cargar notificaciones.");
    }
  }
}
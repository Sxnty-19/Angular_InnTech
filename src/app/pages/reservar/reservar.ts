import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from "../../components/navbar/navbar";
import { NavbaraComponent } from "../../components/navbara/navbara";
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, NavbaraComponent, Footer],
  templateUrl: './reservar.html',
  styleUrls: ['./reservar.css']
})
export class ReservasComponent implements OnInit {
  // Estado de Navegación
  activeTab = signal<'crear' | 'activas'>('crear');

  // Datos de Reserva
  date_start = signal('');
  date_end = signal('');
  availRooms = signal<any[]>([]);
  selectedRooms = signal<any[]>([]);
  reservasActivas = signal<any[]>([]);

  // Estado Global
  user: any = null;
  isLoading = signal(false);

  // Sistema de Notificaciones
  message = signal('');
  isSuccess = signal(false);
  showMessage = signal(false);

  // Modal de Cancelación
  isConfirmingCancel = signal(false);
  reservationToCancel = signal<any>(null);

  ngOnInit() {
    const userString = localStorage.getItem('user');
    if (userString) {
      this.user = JSON.parse(userString);
      this.cargarReservas();
    }
  }

  showNotification(msg: string, success: boolean) {
    this.message.set(msg);
    this.isSuccess.set(success);
    this.showMessage.set(true);
    setTimeout(() => this.showMessage.set(false), 4000);
  }

  async cargarReservas() {
    if (!this.user?.id_usuario) return;
    try {
      const res = await fetch(`https://inntech-backend.onrender.com/reservas/activas/${this.user.id_usuario}`);
      const data = await res.json();
      this.reservasActivas.set(res.ok ? data.data : []);
    } catch (e) {
      this.reservasActivas.set([]);
    }
  }

  async buscarHabitaciones() {
    if (!this.date_start() || !this.date_end()) {
      return this.showNotification("Seleccione ambas fechas.", false);
    }
    
    this.isLoading.set(true);
    try {
      const res = await fetch(`https://inntech-backend.onrender.com/habitaciones/habitaciones_disponibles?date_start=${this.date_start()}&date_end=${this.date_end()}`);
      const data = await res.json();
      
      if (res.ok) {
        this.availRooms.set(data.data.map((h: any) => ({
          id: h.id_habitacion ?? h.id,
          nombre: h.nombre ?? h.numero ?? `#${h.id_habitacion}`,
        })));
        this.showNotification(`Encontradas ${this.availRooms().length} habitaciones.`, true);
      }
    } catch (e) {
      this.showNotification("Error de conexión.", false);
    } finally {
      this.isLoading.set(false);
    }
  }

  agregarHab(hab: any) {
    if (this.selectedRooms().some(r => r.id === hab.id)) return;
    this.selectedRooms.update(rooms => [...rooms, hab]);
  }

  quitarHab(id: number) {
    this.selectedRooms.update(rooms => rooms.filter(r => r.id !== id));
  }

  async confirmarReserva() {
    this.isLoading.set(true);
    const payload = {
      id_usuario: this.user.id_usuario,
      date_start: this.date_start(),
      date_end: this.date_end(),
      habitaciones: this.selectedRooms().map(r => r.id)
    };

    try {
      const res = await fetch("https://inntech-backend.onrender.com/reservas/create_with_rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.showNotification("¡Reserva creada!", true);
        this.selectedRooms.set([]);
        this.cargarReservas();
      }
    } catch (e) {
      this.showNotification("Error al crear reserva.", false);
    } finally {
      this.isLoading.set(false);
    }
  }

 // ==============================================================
  // MÉTODOS DE CANCELACIÓN (CORREGIDOS PARA ANGULAR)
  // ==============================================================

  hideNotification() {
    this.showMessage.set(false);
    this.message.set('');
  }

  showCancelConfirmation(id: number) {
    this.hideNotification();

    // Accedemos al valor del signal con ()
    const reserva = this.reservasActivas().find((r) => r.id_reserva === id);
    
    if (!reserva) {
      this.showNotification("Reserva no encontrada.", false);
      return;
    }

    const today = new Date();
    const startDate = new Date(reserva.date_start);
    const diffTime = startDate.getTime() - today.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (diffTime < twentyFourHours) {
      this.showNotification(
        "Esta reserva no se puede cancelar (requiere 24h de antelación).",
        false
      );
      return;
    }

    // Guardamos en el signal usando .set()
    this.reservationToCancel.set(reserva);
    this.isConfirmingCancel.set(true);
  }

  async executeCancellation() {
    const reserva = this.reservationToCancel(); // Obtenemos el valor actual
    if (!reserva) return;

    this.isLoading.set(true);
    const id = reserva.id_reserva;

    this.isConfirmingCancel.set(false);

    try {
      const res = await fetch(
        `https://inntech-backend.onrender.com/reservas/cancelar/${id}`,
        { method: "PUT" }
      );

      if (!res.ok) {
        const data = await res.json();
        this.showNotification(data.detail || "Error al cancelar.", false);
        return;
      }

      this.showNotification("Reserva cancelada exitosamente.", true);
      await this.cargarReservas();
    } catch (e) {
      this.showNotification("Error de conexión.", false);
    } finally {
      this.isLoading.set(false);
      this.reservationToCancel.set(null);
    }
  }

  cancelConfirmation() {
    this.isConfirmingCancel.set(false);
    this.reservationToCancel.set(null);
    this.showNotification("Cancelación detenida.", false);
  }
}
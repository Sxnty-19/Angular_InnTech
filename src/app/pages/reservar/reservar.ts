import { Component, OnInit, signal } from '@angular/core';
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
export class ReservarComponent implements OnInit {
  // Estado de navegación
  activeTab = signal<'crear' | 'activas'>('crear');
  
  // Formulario de fechas
  dateStart = signal<string>('');
  dateEnd = signal<string>('');
  
  // Listas de Datos
  availRooms = signal<any[]>([]);
  selectedRooms = signal<any[]>([]);
  reservasActivas = signal<any[]>([]);
  
  // Estados de UI
  isLoading = signal<boolean>(false);
  user: any = null;

  // Sistema de Notificaciones (Estilo Toast)
  notification = signal<{msg: string, isSuccess: boolean, show: boolean}>({
    msg: '', isSuccess: false, show: false
  });

  // Modal de Cancelación
  isConfirmingCancel = signal<boolean>(false);
  reservationToCancel = signal<any>(null);

  private readonly API_BASE = 'https://inntech-backend.onrender.com';

  ngOnInit() {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        this.user = JSON.parse(userString);
        this.cargarReservas();
      } catch (e) {
        console.error("Error al leer usuario", e);
      }
    }
  }

  // --- MÉTODOS DE APOYO ---

  showNotification(msg: string, isSuccess: boolean) {
    // Primero ocultamos cualquier notificación previa
    this.notification.set({ msg, isSuccess, show: true });
    // Auto-ocultar después de 4 segundos (igual que en Svelte)
    setTimeout(() => {
      this.notification.update(n => ({ ...n, show: false }));
    }, 4000);
  }

  // Comprueba si una habitación ya está en la "cesta"
  isSelected(id: number): boolean {
    return this.selectedRooms().some(r => r.id === id);
  }

  // --- LÓGICA DE API ---

  async cargarReservas() {
    if (!this.user?.id_usuario) return;
    try {
      const res = await fetch(`${this.API_BASE}/reservas/activas/${this.user.id_usuario}`);
      const data = await res.json();
      this.reservasActivas.set(res.ok ? data.data : []);
    } catch (e) {
      this.reservasActivas.set([]);
    }
  }

  async buscarHabitaciones() {
    if (!this.dateStart() || !this.dateEnd()) {
      return this.showNotification("Seleccione fecha inicio y fin.", false);
    }

    if (new Date(this.dateEnd()) <= new Date(this.dateStart())) {
      return this.showNotification("La fecha fin debe ser mayor a la de inicio.", false);
    }
    
    this.isLoading.set(true);
    this.availRooms.set([]); // Limpiar búsqueda anterior

    try {
      const res = await fetch(`${this.API_BASE}/habitaciones/habitaciones_disponibles?date_start=${this.dateStart()}&date_end=${this.dateEnd()}`);
      const data = await res.json();
      
      if (res.ok) {
        const rooms = data.data.map((h: any) => ({
          id: h.id_habitacion ?? h.id ?? h.id_h,
          nombre: h.nombre ?? h.numero ?? `#${h.id_habitacion}`,
        }));
        this.availRooms.set(rooms);
        
        if (rooms.length === 0) {
          this.showNotification("No hay disponibilidad para esas fechas.", false);
        } else {
          this.showNotification(`Se encontraron ${rooms.length} habitaciones.`, true);
        }
      }
    } catch (e) {
      this.showNotification("Error de conexión con el servidor.", false);
    } finally {
      this.isLoading.set(false);
    }
  }

  agregarHab(room: any) {
    if (this.isSelected(room.id)) {
      return this.showNotification("Ya has añadido esta habitación.", false);
    }
    this.selectedRooms.update(prev => [...prev, room]);
    this.showNotification(`Habitación ${room.nombre} añadida.`, true);
  }

  quitarHab(id: number) {
    this.selectedRooms.update(prev => prev.filter(r => r.id !== id));
    this.showNotification("Habitación eliminada de la selección.", false);
  }

  async confirmarReserva() {
    if (!this.user) return this.showNotification("Debe iniciar sesión.", false);
    if (this.selectedRooms().length === 0) return this.showNotification("Seleccione al menos una habitación.", false);
    
    this.isLoading.set(true);
    const payload = {
      id_usuario: this.user.id_usuario,
      date_start: this.dateStart(),
      date_end: this.dateEnd(),
      habitaciones: this.selectedRooms().map(r => Number(r.id))
    };

    try {
      const res = await fetch(`${this.API_BASE}/reservas/create_with_rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        this.showNotification("¡Reserva creada exitosamente!", true);
        this.selectedRooms.set([]);
        this.availRooms.set([]);
        this.dateStart.set('');
        this.dateEnd.set('');
        this.cargarReservas();
        // Opcional: mover a la pestaña de activas
        // this.activeTab.set('activas');
      } else {
        this.showNotification(data.detail || "Error al procesar la reserva.", false);
      }
    } catch (e) {
      this.showNotification("Error crítico de conexión.", false);
    } finally {
      this.isLoading.set(false);
    }
  }

  prepararCancelacion(reserva: any) {
    // Regla de 24 horas
    const today = new Date();
    const startDate = new Date(reserva.date_start);
    const diffTime = startDate.getTime() - today.getTime();
    
    if (diffTime < 86400000) { // Menos de 24h en milisegundos
      return this.showNotification("No se puede cancelar con menos de 24h de antelación.", false);
    }

    this.reservationToCancel.set(reserva);
    this.isConfirmingCancel.set(true);
  }

  async ejecutarCancelacion() {
    if (!this.reservationToCancel()) return;
    
    const id = this.reservationToCancel().id_reserva;
    this.isConfirmingCancel.set(false);
    this.isLoading.set(true);

    try {
      const res = await fetch(`${this.API_BASE}/reservas/cancelar/${id}`, { 
        method: 'PUT' 
      });

      if (res.ok) {
        this.showNotification("Reserva cancelada correctamente.", true);
        this.cargarReservas();
      } else {
        this.showNotification("No se pudo cancelar la reserva.", false);
      }
    } catch (e) {
      this.showNotification("Error al conectar con el servidor.", false);
    } finally {
      this.isLoading.set(false);
      this.reservationToCancel.set(null);
    }
  }
}
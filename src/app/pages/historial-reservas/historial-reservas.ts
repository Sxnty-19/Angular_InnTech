import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from "../../components/footer/footer";
import { Navbar } from "../../components/navbar/navbar";
import { NavbaraComponent } from "../../components/navbara/navbara";

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, Footer, Navbar, NavbaraComponent],
  templateUrl: './historial-reservas.html',
  styleUrls: ['./historial-reservas.css']
})
export class HistorialComponent implements OnInit {
  user: any = null;
  historial = signal<any[]>([]);
  error = signal('');
  isLoading = signal(true);
  isLoaded = signal(false);

  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        this.cargarHistorial();
      } else {
        this.error.set("No se encontró información de usuario.");
        this.isLoading.set(false);
      }
    }
  }

  async cargarHistorial() {
    if (!this.user) return;

    const MAX_RETRIES = 3;
    try {
      for (let i = 0; i < MAX_RETRIES; i++) {
        const res = await fetch(
          `https://inntech-backend.onrender.com/reservas/terminadas/${this.user.id_usuario}`
        );
        const data = await res.json();

        if (res.ok) {
          this.historial.set(data.data);
          if (data.data.length === 0) {
            this.error.set("No tienes reservas finalizadas.");
          }
          this.isLoaded.set(true);
          this.isLoading.set(false);
          return;
        }

        // Delay con backoff exponencial
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        } else {
          this.error.set(data.detail ?? "Error al cargar historial.");
        }
      }
    } catch (e) {
      this.error.set("Error de conexión al servidor.");
    } finally {
      this.isLoading.set(false);
    }
  }
}
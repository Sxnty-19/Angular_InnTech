import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbara',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbara.html',
  styleUrls: ['./navbara.css']
})
export class NavbaraComponent implements OnInit {
  private router = inject(Router);

  // Variables de estado usando Signals
  modulos = signal<any[]>([]);
  error = signal<string>('');
  isLoading = signal<boolean>(true);
  isMenuOpen = signal<boolean>(false);
  currentPath = signal<string>('');

  async ngOnInit() {
    // Detectar ruta actual para el estado "active"
    this.currentPath.set(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentPath.set(this.router.url);
    });

    // Cargar datos
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;

    if (!user) {
      this.error.set("Usuario no encontrado");
      this.isLoading.set(false);
      return;
    }

    await this.cargarModulos(user.id_rol);
    this.isLoading.set(false);
  }

  async cargarModulos(idRol: number) {
    if (!idRol) return;

    try {
      const MAX_RETRIES = 3;
      for (let i = 0; i < MAX_RETRIES; i++) {
        const response = await fetch(
          `https://inntech-backend.onrender.com/modulos_roles/get_modulos_by_rol/${idRol}`
        );
        const data = await response.json();

        if (response.ok) {
          this.modulos.set(data.data);
          this.error.set("");
          return;
        }

        if (i < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
        } else {
          this.error.set(data.detail || "No se pudieron cargar los módulos");
        }
      }
    } catch (e) {
      this.error.set("Error de conexión con el servidor");
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(val => !val);
  }

  ir(ruta: string) {
    this.router.navigate([ruta]);
    if (window.matchMedia("(max-width: 768px)").matches) {
      this.isMenuOpen.set(false);
    }
  }
}
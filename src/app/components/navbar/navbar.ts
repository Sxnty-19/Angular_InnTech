import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  private router = inject(Router);

  // Signals para reactividad limpia
  user = signal<any>(null);

  // Computamos el nombre completo para que se actualice si el user cambia
  fullName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return `${u.primer_nombre} ${u.segundo_nombre ?? ''} ${u.primer_apellido} ${u.segundo_apellido ?? ''}`
      .replace(/\s+/g, ' ')
      .trim();
  });

  ngOnInit() {
    this.cargarUsuario();
  }

  cargarUsuario() {
    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user.set(JSON.parse(storedUser));
      }
    }
  }

  irPrincipal() {
    this.router.navigate(['/principal']);
  }

  editarPerfil() {
    this.router.navigate(['/perfil']);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.irPrincipal();
    }
  }
}
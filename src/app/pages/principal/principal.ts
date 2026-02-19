import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { NavbaraComponent } from "../../components/navbara/navbara";

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterLink, Footer, Navbar, NavbaraComponent],
  templateUrl: './principal.html',
  styleUrls: ['./principal.css']
})
export class Principal implements OnInit {
  // Signal para almacenar el objeto de usuario
  user = signal<any>(null);

  // Signal computado para el nombre completo (se actualiza solo cuando user cambia)
  displayName = computed(() => {
    const u = this.user();
    if (!u) return 'Invitado';

    const full = `${u.primer_nombre} ${u.segundo_nombre ?? ''} ${u.primer_apellido} ${u.segundo_apellido ?? ''}`
      .replace(/\s+/g, ' ')
      .trim();

    return full !== '' ? full : u.username;
  });

  ngOnInit() {
    // En Angular, ngOnInit se ejecuta solo en el cliente, es seguro usar localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.user.set(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parseando usuario", e);
      }
    }
  }
}
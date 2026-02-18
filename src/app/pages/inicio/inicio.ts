import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, Footer, Navbar],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
    habitaciones = [
    {
      nombre: 'Habitación Individual',
      descripcion: 'Perfecta para viajeros solitarios.',
      imagen: 'img/habitaciones/h1.jpg'
    },
    {
      nombre: 'Habitación Doble',
      descripcion: 'Ideal para parejas o amigos.',
      imagen: 'img/habitaciones/h2.jpg'
    },
    {
      nombre: 'Habitación Familiar',
      descripcion: 'Espacio amplio para toda la familia.',
      imagen: 'img/habitaciones/h3.jpg'
    }
  ];
}
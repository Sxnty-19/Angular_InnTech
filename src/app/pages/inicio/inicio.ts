import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer'; // Ajusta la ruta si es necesario
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, Footer],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio {
  habitaciones = [
    {
      nombre: "Habitación Sencilla",
      descripcion: "Diseñada para el viajero solitario, ofrece comodidad y privacidad con una cama individual grande.",
      imagen: "/habitaciones/sencilla.png",
    },
    {
      nombre: "Habitación Doble",
      descripcion: "Perfecta para parejas o dos amigos. Disponible con una cama doble grande o dos camas individuales.",
      imagen: "/habitaciones/doble.png",
    },
    {
      nombre: "Habitación Múltiple",
      descripcion: "Ideal para grupos pequeños o familias. Ofrece tres o cuatro camas individuales cómodas.",
      imagen: "/habitaciones/multiple.png",
    },
    {
      nombre: "Habitación Quíntuple",
      descripcion: "Gran espacio con cinco camas, pensada para equipos deportivos o grandes grupos de amigos.",
      imagen: "/habitaciones/quintuple.png",
    },
    {
      nombre: "Habitación Séxtuple",
      descripcion: "Nuestra opción más espaciosa, con seis camas. Máxima capacidad y excelente para delegaciones.",
      imagen: "/habitaciones/sextuple.png",
    },
  ];
}
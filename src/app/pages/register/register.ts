import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// 1. Definimos la estructura exacta del usuario
interface UserInfo {
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  telefono: string;
  correo: string;
  username: string;
  password: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  private router = inject(Router);

  // 2. Tipamos el Signal con la Interfaz
  formData = signal<UserInfo>({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    correo: '',
    username: '',
    password: '',
  });

  confirmPassword = signal('');
  inlineError = signal('');
  isLoading = signal(false);
  passwordVisible = signal(false);
  confirmPasswordVisible = signal(false);
  message = signal('');
  isSuccess = signal(false);
  showMessage = signal(false);

  // 3. Tipamos las llaves de los campos explícitamente como keyof UserInfo
  campos: { label: string; key: keyof UserInfo; required: boolean; span: number; type?: string }[] = [
    { label: "Primer Nombre", key: "primer_nombre", required: true, span: 6 },
    { label: "Segundo Nombre", key: "segundo_nombre", required: false, span: 6 },
    { label: "Primer Apellido", key: "primer_apellido", required: true, span: 6 },
    { label: "Segundo Apellido", key: "segundo_apellido", required: false, span: 6 },
    { label: "Teléfono", key: "telefono", type: "tel", required: true, span: 6 },
    { label: "Correo Electrónico", key: "correo", type: "email", required: true, span: 6 },
    { label: "Usuario", key: "username", required: true, span: 12 },
    { label: "Contraseña", key: "password", type: "password", required: true, span: 6 },
  ];
  toggleVisibility(field: 'pass' | 'confirm') {
    if (field === 'pass') this.passwordVisible.update(v => !v);
    else this.confirmPasswordVisible.update(v => !v);
  }

  async handleRegister() {
    this.inlineError.set('');
    this.showMessage.set(false);

    if (this.formData().password !== this.confirmPassword()) {
      this.inlineError.set("La contraseña y su confirmación no coinciden.");
      return;
    }

    this.isLoading.set(true);

    try {
      const response = await fetch("https://inntech-backend.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_rol: 3,
          estado: 1,
          ...this.formData(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        this.message.set(result.detail || "Error al registrar usuario.");
        this.isSuccess.set(false);
        this.showMessage.set(true);
        return;
      }

      this.message.set("¡Usuario registrado exitosamente! Redirigiendo...");
      this.isSuccess.set(true);
      this.showMessage.set(true);

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

    } catch (error) {
      this.inlineError.set("Error de conexión con el servidor.");
    } finally {
      this.isLoading.set(false);
    }
  }
}
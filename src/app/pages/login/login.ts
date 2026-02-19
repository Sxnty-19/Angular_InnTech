import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private router = inject(Router);

  // Estados del formulario (Signals)
  username = signal('');
  password = signal('');
  inlineError = signal('');
  isLoading = signal(false);
  passwordVisible = signal(false);

  // Estados del modal de mensaje
  message = signal('');
  isSuccess = signal(false);
  showMessage = signal(false);

  togglePasswordVisibility() {
    this.passwordVisible.update(v => !v);
  }

  async handleLogin() {
    this.inlineError.set('');
    this.showMessage.set(false);

    if (!this.username() || !this.password()) {
      this.inlineError.set('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    this.isLoading.set(true);

    try {
      const formData = new FormData();
      formData.append('username', this.username());
      formData.append('password', this.password());

      const response = await fetch('https://inntech-backend.onrender.com/auth/login', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        this.inlineError.set(data.detail || 'Credenciales incorrectas.');
        return;
      }

      if (data.success) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        const user = data.user;
        const fullName = `${user.primer_nombre} ${user.segundo_nombre ?? ''} ${user.primer_apellido} ${user.segundo_apellido ?? ''}`
          .replace(/\s+/g, ' ')
          .trim();

        this.message.set(`¡Bienvenido(a), ${fullName}!`);
        this.isSuccess.set(true);
        this.showMessage.set(true);

        setTimeout(() => {
          this.router.navigate(['/principal']);
        }, 1500);
      } else {
        this.inlineError.set('No se pudo iniciar sesión. Verifica tus datos.');
      }
    } catch (e) {
      this.inlineError.set('Error de conexión. Inténtalo de nuevo más tarde.');
    } finally {
      this.isLoading.set(false);
    }
  }

  irRecuperarContrasena() {
    this.message.set('Funcionalidad de recuperación de contraseña en desarrollo.');
    this.isSuccess.set(false);
    this.showMessage.set(true);
    // Auto-cerrar el modal después de 3 segundos
    setTimeout(() => this.showMessage.set(false), 3000);
  }
}
import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Principal } from './pages/principal/principal';
import { ReservasComponent } from './pages/reservar/reservar';
import { HistorialComponent } from './pages/historial-reservas/historial-reservas';
import { PerfilComponent } from './pages/perfil/perfil';
import { Notificar } from './pages/notificar/notificar';
import { InformacionTuristica } from './pages/informacion-turistica/informacion-turistica';

export const routes: Routes = [
  { path: 'navbar', component: Navbar },
  { path: 'footer', component: Footer },
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'principal', component: Principal },
  { path: 'reserva', component: ReservasComponent },
  { path: 'historial', component: HistorialComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'notificar', component: Notificar },
  { path: 'informacion-turistica', component: InformacionTuristica },
];
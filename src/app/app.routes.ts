import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Principal } from './pages/principal/principal';
import { ReservarComponent } from './pages/reservar/reservar';
import { HistorialComponent } from './pages/historial-reservas/historial-reservas';
import { PerfilComponent } from './pages/perfil/perfil';
import { Notificar } from './pages/notificar/notificar';
import { InformacionTuristica } from './pages/informacion-turistica/informacion-turistica';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'principal', component: Principal },
  { path: 'reservar', component: ReservarComponent },
  { path: 'historial', component: HistorialComponent },
  { path: 'historial_reservas', component: HistorialComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'notificar', component: Notificar },
  { path: 'informacion-turistica', component: InformacionTuristica },
  { path: 'informacion_turitica', component: InformacionTuristica },
];
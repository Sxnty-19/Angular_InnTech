import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from "../../components/footer/footer";
import { Navbar } from "../../components/navbar/navbar";
import { NavbaraComponent } from "../../components/navbara/navbara";

@Component({
  selector: 'app-informacion-turistica',
  standalone: true,
  imports: [CommonModule, Footer, Navbar, NavbaraComponent],
  templateUrl: './informacion-turistica.html',
  styleUrls: ['./informacion-turistica.css']
})
export class InformacionTuristica implements OnInit {
  private readonly API = "https://turismo-sm.onrender.com";

  // Estado de la categoría actual
  currentCategory = signal<'eventos' | 'lugares' | 'servicios'>('eventos');

  // Signals para los datos
  eventos = signal<any[]>([]);
  lugares = signal<any[]>([]);
  servicios = signal<any[]>([]);

// Cambia la definición de los signals de loading y errors así:

// Estado de carga con tipos fijos
loading = signal({
  eventos: true,
  lugares: true,
  servicios: true
});

// Estado de errores con tipos fijos (Quitamos la firma de índice genérica)
errors = signal<{
  eventos: string | null;
  lugares: string | null;
  servicios: string | null;
}>({
  eventos: null,
  lugares: null,
  servicios: null
});
  ngOnInit() {
    this.cargarTodo();
  }

  async cargarTodo() {
    // Ejecutar las tres cargas en paralelo
    await Promise.all([
      this.fetchData('evento', 'eventos', this.eventos),
      this.fetchData('lugar', 'lugares', this.lugares),
      this.fetchData('servicio', 'servicios', this.servicios)
    ]);
  }

  async fetchData(endpoint: string, category: 'eventos' | 'lugares' | 'servicios', signalTarget: any) {
    this.updateLoading(category, true);
    this.updateError(category, null);

    const MAX_RETRIES = 3;
    
    try {
      for (let i = 0; i < MAX_RETRIES; i++) {
        const res = await fetch(`${this.API}/${endpoint}/`);
        
        if (res.ok) {
          const data = await res.json();
          signalTarget.set(data);
          this.updateLoading(category, false);
          return;
        }

        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        } else {
          throw new Error(`Error ${res.status}`);
        }
      }
    } catch (e) {
      this.updateError(category, `No se pudieron cargar los ${category}.`);
      this.updateLoading(category, false);
    }
  }

  // Helpers para actualizar estados parciales del signal de objeto
  private updateLoading(category: 'eventos' | 'lugares' | 'servicios', value: boolean) {
    this.loading.update(prev => ({ ...prev, [category]: value }));
  }

  private updateError(category: 'eventos' | 'lugares' | 'servicios', value: string | null) {
    this.errors.update(prev => ({ ...prev, [category]: value }));
  }

  getFieldValue(item: any, esKey: string, enKey: string): string {
    return item[esKey] ?? item[enKey] ?? "-";
  }
}
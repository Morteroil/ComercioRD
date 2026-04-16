import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel, 
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, 
  IonButton, IonIcon, IonRow, IonCol,
  IonItem, IonSelect, IonSelectOption, IonGrid 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { call, star, navigate, shareSocial, filter } from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    FormsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonSearchbar, IonSegment, IonSegmentButton, IonLabel, 
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, 
    IonButton, IonIcon, IonRow, IonCol,
    IonItem, IonSelect, IonSelectOption, IonGrid
  ],
})
export class Tab1Page {
  negocios: any[] = [];
  negociosFiltrados: any[] = [];
  textoBusqueda: string = '';
  categoriaSeleccionada: string = 'todos';
  filtroHorario: string = 'todos';
  calificacionMinima: number = 0; 

  constructor(private router: Router) { 
    addIcons({ call, star, navigate, shareSocial, filter }); 
  }

  ionViewWillEnter() {
    this.cargarDirectorio();
  }

  async cargarDirectorio() {
    let listaLocal: any[] = [];
    const status = await Network.getStatus();
    const LLAVE_CACHE = 'cache_comercio_rd';

    if (status.connected) {
      try {
        const resNube = await fetch('https://comerciord-aab78-default-rtdb.firebaseio.com/negocios.json');
        const datosNube = await resNube.json();
        let listaFirebase: any[] = [];
        
        if (datosNube) {
          for (let id in datosNube) {
            listaFirebase.push({ id, ...datosNube[id] });
          }
        }

        const resResenas = await fetch('https://comerciord-aab78-default-rtdb.firebaseio.com/resenas.json');
        let resenasNube: any[] = [];
        if (resResenas.ok) {
          const datosResenas = await resResenas.json();
          if (datosResenas) {
            for (let id in datosResenas) {
              resenasNube.push(datosResenas[id]);
            }
          }
        }

        listaFirebase.forEach(negocio => {
          const nombreNegocio = (negocio.nombre || '').trim().toLowerCase();
          
          const reseñasDelNegocio = resenasNube.filter(r => {
            const nombreEnResena = (r.negocio || '').trim().toLowerCase();
            return nombreEnResena === nombreNegocio;
          });

          if (reseñasDelNegocio.length > 0) {
            let suma = 0;
            reseñasDelNegocio.forEach(r => suma += r.estrellas);
            negocio.calificacion = parseFloat((suma / reseñasDelNegocio.length).toFixed(1)); 
          } else {
            if (!negocio.calificacion) negocio.calificacion = 0; 
          }
        });

        await Preferences.set({ key: LLAVE_CACHE, value: JSON.stringify(listaFirebase) });
        this.negocios = listaFirebase;

      } catch (e) { console.error("Error:", e); }

    } else {
      const cache = await Preferences.get({ key: LLAVE_CACHE });
      if (cache.value) {
        this.negocios = JSON.parse(cache.value);
      }
    }

    try {
      const resLocal = await fetch('/assets/api-negocios.json');
      if (resLocal.ok) {
        listaLocal = await resLocal.json();
      }
    } catch (e) { }

    this.negocios = [...listaLocal, ...this.negocios]; 
    this.negociosFiltrados = [...this.negocios];
    this.aplicarFiltros();
  }

  // --- NUEVAS FUNCIONES DE HORARIO ---
  formatearHora(horaNum: number): string {
    if (horaNum === undefined || horaNum === null) return 'No definido';
    
    const hora = Math.floor(horaNum);
    const minutos = (horaNum % 1) === 0.5 ? '30' : '00';
    let ampm = hora >= 12 && hora < 24 ? 'PM' : 'AM';
    let hora12 = hora % 12;
    if (hora12 === 0) hora12 = 12; // Las 12 o las 0 (medianoche) se muestran como 12
    
    if (horaNum === 24) return '12:00 AM'; // Caso especial para medianoche
    
    return `${hora12}:${minutos} ${ampm}`;
  }

  estaAbierto(horaAbre: number, horaCierra: number): boolean {
    if (!horaAbre || !horaCierra) return false;
    
    const ahora = new Date();
    // Convertimos la hora real a decimal (ej. 8:30 PM = 20.5)
    const horaActualDecimal = ahora.getHours() + (ahora.getMinutes() / 60);
    
    const abre = parseFloat(horaAbre as any);
    const cierra = parseFloat(horaCierra as any);

    return horaActualDecimal >= abre && horaActualDecimal < cierra;
  }
  // -----------------------------------

  buscarPorTexto(event: any) {
    this.textoBusqueda = event.target.value.toLowerCase();
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    // Esta pequeña herramienta borra las tildes mentalmente antes de comparar
    const quitarTildes = (texto: string) => {
      return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    this.negociosFiltrados = this.negocios.filter(negocio => {
      // 1. Búsqueda por texto (sin importar tildes)
      const nombreSeguro = quitarTildes(negocio.nombre ? negocio.nombre.toLowerCase() : '');
      const descSegura = quitarTildes(negocio.descripcion ? negocio.descripcion.toLowerCase() : '');
      const busquedaSegura = quitarTildes(this.textoBusqueda ? this.textoBusqueda.toLowerCase() : '');
      const coincideTexto = nombreSeguro.includes(busquedaSegura) || descSegura.includes(busquedaSegura);
      
      // 2. Filtro de Categoría a prueba de tildes
      const catNegocio = quitarTildes(negocio.categoria ? negocio.categoria.toLowerCase().trim() : '');
      const catSelect = quitarTildes(this.categoriaSeleccionada ? this.categoriaSeleccionada.toLowerCase().trim() : 'todos');
      const coincideCategoria = catSelect === 'todos' || catNegocio === catSelect;
      
      const coincideEstrellas = (negocio.calificacion || 0) >= this.calificacionMinima;

      // 3. Filtro de Horario
      let coincideHorario = true;
      if (this.filtroHorario === 'abierto') {
        coincideHorario = this.estaAbierto(negocio.horaApertura, negocio.horaCierre);
      }

      return coincideTexto && coincideCategoria && coincideEstrellas && coincideHorario;
    });
  }

  llamarNegocio(telefono: string) { 
    window.open('tel:' + telefono, '_system'); 
  }

  abrirMapa(negocio: any) {
    const consulta = (negocio.nombre && negocio.direccion) 
                     ? `${negocio.nombre}, ${negocio.direccion}` 
                     : negocio.direccion;
    
    if (!consulta) return;
    
    // URL OFICIAL DE GOOGLE MAPS CORREGIDA Y CON EL SIGNO $
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
    window.open(url, '_blank');
  }

  async compartirNegocio(negocio: any) {
    const consulta = `${negocio.nombre}, ${negocio.direccion}`;
    
    // URL oficial y segura de Google Maps (Esta no falla en Android)
    const urlMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
    
    try {
      await Share.share({
        title: negocio.nombre,
        text: `¡Mira este negocio en ComercioRD! ${negocio.nombre}.`,
        url: urlMapa,
        dialogTitle: 'Compartir negocio'
      });
    } catch (error) {
      console.error('Error al abrir el menú de compartir:', error);
    }
  }

  escribirResena(nombreNegocio: string) {
    this.router.navigate(['/tabs/tab2'], { queryParams: { negocio: nombreNegocio } });
  }
}
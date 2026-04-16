import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- Súper importante para los ciclos HTML
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonItem, IonSelect, IonSelectOption, IonTextarea, IonButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { send, star } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, // <-- Lo agregamos aquí
    FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonSelect, IonSelectOption, IonTextarea, IonButton, IonIcon, IonLabel
  ]
})
export class Tab2Page implements OnInit {
  negocioSeleccionado: string = 'Ningún negocio seleccionado';
  listaResenas: any[] = []; // <-- Aquí guardaremos los comentarios que bajen de la nube
  
  resena = {
    estrellas: 5,
    comentario: '',
    fecha: ''
  };

  constructor(private route: ActivatedRoute) {
    addIcons({ send, star });
  }

  ngOnInit() {
    // Al entrar a la pestaña, verificamos de qué negocio nos hablan
    this.route.queryParams.subscribe(params => {
      if (params['negocio']) {
        this.negocioSeleccionado = params['negocio'];
        this.cargarResenas(); // <-- Mandamos a buscar los comentarios a Firebase
      }
    });
  }

  async cargarResenas() {
    try {
      const res = await fetch('https://comerciord-aab78-default-rtdb.firebaseio.com/resenas.json');
      if (res.ok) {
        const data = await res.json();
        const todasLasResenas = [];
        
        if (data) {
          for (let id in data) {
            todasLasResenas.push(data[id]);
          }
        }
        
        // Filtramos para que SOLO nos muestre los comentarios del negocio que estamos viendo
        this.listaResenas = todasLasResenas.filter(r => r.negocio === this.negocioSeleccionado);
      }
    } catch (error) {
      console.error("Error cargando reseñas:", error);
    }
  }

  async enviarResena() {
    if (!this.resena.comentario) {
      alert('Por favor, escribe un comentario antes de enviar.');
      return;
    }

    const resenaCompleta = {
      negocio: this.negocioSeleccionado,
      estrellas: this.resena.estrellas,
      comentario: this.resena.comentario,
      fecha: new Date().toISOString()
    };

    try {
      // Enviamos a la nube
      const respuesta = await fetch('https://comerciord-aab78-default-rtdb.firebaseio.com/resenas.json', {
        method: 'POST',
        body: JSON.stringify(resenaCompleta)
      });

      if (respuesta.ok) {
        alert('¡Gracias! Tu reseña ha sido publicada.');
        this.resena.comentario = ''; // Limpiamos la caja de texto
        this.cargarResenas(); // <-- Actualizamos la lista para que se vea el comentario nuevo de inmediato
      }
    } catch (error) {
      console.error("Error al guardar reseña:", error);
      alert('No se pudo conectar con la base de datos.');
    }
  }
}
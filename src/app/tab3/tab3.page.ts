import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonInput, IonSelect, IonSelectOption, 
  IonButton, IonIcon, IonTextarea, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, camera } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    FormsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonInput, IonSelect, IonSelectOption, 
    IonButton, IonIcon, IonTextarea, IonRow, IonCol
  ],
})
export class Tab3Page {
  fotoUrl: string | undefined;

  nuevoNegocio = {
    nombre: '',
    telefono: '',
    direccion: '',
    categoria: 'Comida',
    descripcion: '',
    horaApertura: 8,
    horaCierre: 22
  };

  constructor() { addIcons({ save, camera }); }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90, 
        allowEditing: false, 
        resultType: CameraResultType.DataUrl, 
        // PROMPT es lo que hace que salga el menú preguntando "Cámara o Galería"
        source: CameraSource.Prompt 
      });
      this.fotoUrl = image.dataUrl; 
    } catch (error) {
      console.log('El usuario cerró la cámara o hubo un error al abrirla.');
    }
  }

  async guardarNegocio() {
    if (!this.nuevoNegocio.nombre || !this.nuevoNegocio.direccion || !this.nuevoNegocio.descripcion) {
      alert('Por favor, llena el nombre, la dirección y la descripción del local.');
      return;
    }

    const status = await Network.getStatus();
    if (!status.connected) {
      alert('📡 Estás sin conexión a Internet. Conéctate a una red WiFi o activa tus datos móviles para registrar un negocio nuevo.');
      return; 
    }

    const negocioCompleto = {
      nombre: this.nuevoNegocio.nombre,
      categoria: this.nuevoNegocio.categoria,
      calificacion: 0, 
      descripcion: this.nuevoNegocio.descripcion, 
      direccion: this.nuevoNegocio.direccion,
      telefono: this.nuevoNegocio.telefono,
      horaApertura: this.nuevoNegocio.horaApertura, 
      horaCierre: this.nuevoNegocio.horaCierre,     
      imagen: this.fotoUrl || 'https://ionicframework.com/docs/img/demos/card-media.png'
    };

    try {
      const respuesta = await fetch('https://comerciord-aab78-default-rtdb.firebaseio.com/negocios.json', {
        method: 'POST',
        body: JSON.stringify(negocioCompleto)
      });

      if (respuesta.ok) {
        alert('¡ÉXITO! Negocio guardado en la base de datos central.');
        this.nuevoNegocio = { nombre: '', telefono: '', direccion: '', categoria: 'Comida', descripcion: '', horaApertura: 8, horaCierre: 22 };
        this.fotoUrl = undefined;
      }
    } catch (error) {
      console.error("Error en Firebase:", error);
      alert('Error de conexión con la nube.');
    }
  }
}
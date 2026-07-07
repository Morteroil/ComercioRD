# ComercioRD - Directorio Comercial Local 🇩🇴

##  Descripción del Sistema
ComercioRD es una aplicación móvil multiplataforma diseñada para centralizar y digitalizar el ecosistema de negocios locales. Funciona como un directorio interactivo tolerante a fallos de red (offline mode), que permite a los usuarios buscar comercios, verificar su disponibilidad en tiempo real mediante un motor matemático de cálculo horario, y publicar reseñas de sus experiencias.

## Objetivo
Proporcionar una plataforma digital centralizada que aumente la visibilidad de los comercios locales frente a las grandes competencias, empoderando al mismo tiempo a la comunidad de consumidores con información precisa, geolocalizada y al alcance de la mano.

##  Tecnologías Utilizadas
* **Frontend y UI:** Ionic Framework y Angular v17+ (Componentes Standalone).
* **Backend y Base de Datos:** Firebase Realtime Database (NoSQL).
* **Integración Nativa (Hardware):** Capacitor (Camera Plugin, Network, Preferences y Share API).
* **Control de Versiones:** Git y GitHub.

##  Instrucciones de Instalación y Ejecución
Para clonar, compilar y ejecutar este proyecto en un entorno de desarrollo local, asegúrate de tener instalado Node.js y el CLI de Ionic. Luego, ejecuta los siguientes comandos en tu terminal:

1. **Restauración de Dependencias:**
   ```bash
   npm install
   ionic build
    ```
**1. Sincronización Nativa (Hadware Bridge)**
```
npx cap sync
```
**2. Ensamblaje del Binario (APK en Android Studio)**
  ```
   cd android
.\gradlew clean
.\gradlew assembleDebug
```


Capturas como envidencias



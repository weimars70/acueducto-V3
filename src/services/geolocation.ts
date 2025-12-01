import { Capacitor } from '@capacitor/core';
import { Geolocation, type Position, type PositionOptions } from '@capacitor/geolocation'; 

/**
 * Obtiene la latitud, longitud y precisión (accuracy) de la ubicación actual.
 * Maneja la verificación de permisos y el fallback entre Capacitor (nativo) y
 * la API estándar del navegador (web).
 * @returns Un objeto con las coordenadas o null si hay un error/permiso denegado.
 */
export async function getCurrentCoords(): Promise<{ lat: number|null, lng: number|null, accuracy: number|null }> {
  try {
    let finalStatus: string = 'prompt';
    
    // Opciones para alta precisión, 10s de timeout y sin caché.
    const options: PositionOptions = { 
      enableHighAccuracy: true, 
      timeout: 10000, 
      maximumAge: 0 
    };

    // --- 1. VERIFICACIÓN Y SOLICITUD DE PERMISOS ---
    const permResult = await Geolocation.checkPermissions();
    finalStatus = permResult.location;

    if (finalStatus !== 'granted') {
      const req = await Geolocation.requestPermissions();
      finalStatus = req.location; 
    }

    // 2. Detener si el permiso NO fue otorgado
    if (finalStatus !== 'granted') {
      console.error('Permiso de Geolocation denegado por el usuario o no disponible.');
      return { lat: null, lng: null, accuracy: null };
    }
    
    let position: Position;

    // --- 3. LÓGICA DE DETECCIÓN DE ENTORNO ---
    
    // CASO A: Ejecución en NAVEGADOR (Web, PWA)
    // Utilizamos el !Capacitor.isNativePlatform() y verificamos la API estándar.
    if (!Capacitor.isNativePlatform() && 'geolocation' in navigator) {
      console.log('Usando Geolocation del Navegador...');
      
      // Adaptamos la API de callback del navegador a una Promise (async/await)
      position = await new Promise<Position>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos as Position), 
          (error) => reject(error), 
          options
        );
      });
    } 
    // CASO B: Ejecución NATIVA (Android/iOS)
    else if (Capacitor.isNativePlatform()) {
      console.log('Usando Plugin Nativo de Capacitor...');
      // Usamos el plugin de Capacitor
      position = await Geolocation.getCurrentPosition(options);
    } 
    // CASO C: Entorno no soportado o indefinido
    else {
      console.warn('El entorno no es nativo ni un navegador compatible con Geolocation.');
      return { lat: null, lng: null, accuracy: null };
    }
    
    // --- 4. RETORNO DE COORDENADAS ---
    console.log('Posición obtenida:', position.coords);
    
    return { 
      lat: position.coords.latitude, 
      lng: position.coords.longitude, 
      accuracy: position.coords.accuracy 
    };
    
  } catch (error) {
    // Esto captura timeouts, errores de permiso del navegador, o errores nativos.
    console.error('Geolocation error:', error);
    return { lat: null, lng: null, accuracy: null };
  }
}
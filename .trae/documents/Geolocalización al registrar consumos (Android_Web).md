## Dependencias y sincronización

* Instalar plugin: `npm install @capacitor/geolocation`

* Sincronizar Capacitor: `npx cap sync`

## Permisos de plataforma

* Android: editar `android/app/src/main/AndroidManifest.xml` y agregar:

  * `<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />`

  * `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />`

* iOS (si aplica): en `ios/App/App/Info.plist` añadir:

  * `<key>NSLocationWhenInUseUsageDescription</key>`

  * `<string>La app necesita acceder a tu ubicación para registrar correctamente los consumos.</string>`

## Servicio de geolocalización (frontend)

* Crear `src/services/geolocation.ts` con permisos robustos, retorno uniforme y fallback web:

```ts
import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'

export async function getCurrentCoords(): Promise<{ lat: number|null, lng: number|null, accuracy: number|null }> {
  try {
    const permResult = await Geolocation.checkPermissions()
    if (permResult.location !== 'granted') {
      await Geolocation.requestPermissions()
    }

    if (!Capacitor.isNativePlatform() && 'geolocation' in navigator) {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
      })
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
    }

    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
    return { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy }
  } catch (error) {
    return { lat: null, lng: null, accuracy: null }
  }
}
```

## Integración en flujo de registro

* En `src/composables/useConsumptionForm.ts` dentro de `saveConsumption`:

  * Antes de construir `consumptionData` (≈ `src/composables/useConsumptionForm.ts:104`), obtener coordenadas:

    * `const coords = await getCurrentCoords()`

  * Incluir en el payload:

    * `latitud: coords.lat`, `longitud: coords.lng`

  * UX opcional: si no se pudo obtener ubicación, mostrar aviso Quasar:

    * `Notify.create({ type: 'warning', message: 'No se pudo obtener la ubicación.' })`

* En `src/services/api/consumption.service.ts:73`, asegurar que `create(...)` envíe `latitud` y `longitud` si existen en el objeto de consumo.

## Tipos y almacenamiento offline (frontend)

* `src/types/consumption.ts`: añadir campos opcionales `latitud?: number`, `longitud?: number`.

* `src/services/database/storage.service.ts`:

  * Incluir `latitud` y `longitud` en `normalizeConsumptionData` y en el guardado offline, para conservar ubicación sin conexión.

## Backend (NestJS)

* DTO `backend/src/consumo/dto/create-consumo.dto.ts`:

```ts
@IsOptional() @IsNumber() latitud?: number
@IsOptional() @IsNumber() longitud?: number
```

* Entidad TypeORM `backend/src/entities/consumption.entity.ts`:

```ts
@Column({ type: 'float', nullable: true }) latitud: number
@Column({ type: 'float', nullable: true }) longitud: number
```

* Servicio `backend/src/consumo/consumo.service.ts` (método `create`):

  * Incluir `latitud` y `longitud` en `consumptionData` junto a los demás campos.

  * Mantener verificación de duplicados y respuesta de conflicto.

* SQL (si columnas no existen):

```sql
ALTER TABLE public.consumo ADD COLUMN IF NOT EXISTS latitud double precision NULL;
ALTER TABLE public.consumo ADD COLUMN IF NOT EXISTS longitud double precision NULL;
```

* Índice opcional (solo si se harán búsquedas por distancia):

```ts
// @Index(['latitud', 'longitud'])
```

## Construcción y pruebas

* Sincronizar Capacitor: `npx cap sync`

* Android:

  * Construir: `quasar build -m capacitor -T android`

  * Abrir: `npx cap open android`

* Validación:

  * Al registrar un consumo, pedir permisos la primera vez.

  * Registrar coordenadas en consola/logs.

  * Confirmar que backend guarda `latitud` y `longitud`.

## Notas de integración

* No cambiar puertos ni reiniciar servidores automáticamente.

* Si no hay coordenadas, el registro no se bloquea; se envían `null`.

* Compatibilidad offline: conservar `latitud` y `longitud` en almacenamiento local y sincronizar luego.


<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" @show="onDialogShow">
    <q-card style="width: 900px; max-width: 95vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Ubicación: {{ nombre }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div id="map-container" style="height: 500px; width: 100%; border-radius: 8px;"></div>
        <div class="q-mt-md row q-gutter-md justify-center">
          <div class="col-auto">
            <q-badge color="primary" class="q-pa-sm">
              Latitud: {{ latitud }}
            </q-badge>
          </div>
          <div class="col-auto">
            <q-badge color="secondary" class="q-pa-sm">
              Longitud: {{ longitud }}
            </q-badge>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-1">
        <q-btn flat label="Cerrar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps<{
  modelValue: boolean;
  latitud: number;
  longitud: number;
  nombre: string;
}>();

defineEmits(['update:modelValue']);

let map: L.Map | null = null;

const onDialogShow = async () => {
  await nextTick();
  
  // Pequeño delay adicional para asegurar que el contenedor esté listo en el DOM
  setTimeout(() => {
    initMap();
  }, 100);
};

const initMap = () => {
  if (map) {
    map.remove();
  }

  const lat = props.latitud;
  const lng = props.longitud;

  // Definición de las capas de mapa
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  const hybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps'
  });

  // Inicializar el mapa con la capa híbrida (Satélite + Vías) por defecto ya que es lo que pidió el usuario
  map = L.map('map-container', {
    center: [lat, lng],
    zoom: 18,
    layers: [hybrid]
  });

  // Agregar control de capas
  const baseMaps = {
    "Calles (OSM)": osm,
    "Satélite (Esri)": satellite,
    "Híbrido (Google)": hybrid
  };

  L.control.layers(baseMaps).addTo(map);

  // Definir icono personalizado (Estilo Pegman amarillo)
  const yellowIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  L.marker([lat, lng], { icon: yellowIcon }).addTo(map)
    .bindPopup(props.nombre)
    .openPopup();
    
  // Forzar redimensionamiento para evitar errores de renderizado en diálogos
  setTimeout(() => {
    map?.invalidateSize();
  }, 200);
};
</script>

<style scoped>
#map-container {
  border: 1px solid #ddd;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

/* Arreglo para iconos de marcador que a veces fallan en Leaflet con Webpack/Vite */
:deep(.leaflet-default-icon-path) {
  background-image: url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png);
}
</style>

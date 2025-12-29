<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { installationService } from '../../../services/api/installation.service';
import { syncService } from '../../../services/sync/sync.service';

const emit = defineEmits<{
  (e: 'installation-found', data: any): void;
}>();

const $q = useQuasar();
const codigo = ref('');
const loading = ref(false);

const handleSearch = async () => {
  console.log('🔍 InstallationCodeField - Iniciando búsqueda');
  console.log('📊 Código ingresado:', codigo.value);

  if (!codigo.value) {
    console.warn('⚠️ Código vacío');
    $q.notify({
      type: 'warning',
      message: 'Ingrese un código de instalación'
    });
    return;
  }

  loading.value = true;
  console.log('🔄 Llamando a installationService.getByCode con código:', Number(codigo.value));

  try {
    const installation = await installationService.getByCode(Number(codigo.value));
    console.log('📦 Respuesta del servicio:', installation);
    console.log('📋 Detalles de la instalación:', {
      tiene_datos: !!installation,
      codigo: installation?.codigo,
      nombre: installation?.nombre,
      sector: installation?.sector_nombre,
      direccion: installation?.direccion,
      medidor: installation?.codigo_medidor,
      lectura_anterior: installation?.lectura_anterior,
      promedio: installation?.promedio
    });

    if (!installation) {
      console.error('❌ Instalación no encontrada - el servicio retornó null/undefined');
      throw new Error('Instalación no encontrada');
    }

    // Asegurarse de que los valores numéricos estén presentes
    const normalizedInstallation = {
      ...installation,
      lectura_anterior: installation.lectura_anterior || 0,
      promedio: installation.promedio || 0
    };

    console.log('✅ Emitiendo evento installation-found con datos:', normalizedInstallation);
    emit('installation-found', normalizedInstallation);

    if (!syncService.isOnline()) {
      console.log('📡 Modo sin conexión detectado');
      $q.notify({
        type: 'warning',
        message: 'Trabajando en modo sin conexión',
        timeout: 2000
      });
    }
  } catch (error) {
    console.error('❌ Error buscando instalación:', error);
    console.error('❌ Detalles del error:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : 'No stack',
      type: typeof error
    });
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al buscar la instalación',
      timeout: 2000
    });
    emit('installation-found', null);
  } finally {
    loading.value = false;
    console.log('🏁 Búsqueda finalizada');
  }
};

const handleInput = (value: string) => {
  // Solo permitir números y limitar a 5 dígitos
  codigo.value = value.replace(/[^\d]/g, '').slice(0, 5);
};

const handleKeyPress = async (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    await handleSearch();
  }
};

const clear = () => {
  codigo.value = '';
};

const setCode = async (value: string) => {
  codigo.value = value;
  await handleSearch();
};

defineExpose({
  clear,
  setCode,
  focus: () => {
    const input = document.querySelector('input[aria-label="Código"]');
    if (input) {
      input.focus();
    }
  }
});
</script>

<template>
  <q-input
    v-model="codigo"
    label="Código"
    outlined
    dense
    :rules="[val => !!val || 'Campo requerido']"
    @keypress="handleKeyPress"
    @input="handleInput"
    :loading="loading"
  >
    <template v-slot:append>
      <q-icon
        name="search"
        class="cursor-pointer"
        @click="handleSearch"
      />
    </template>
  </q-input>
</template>
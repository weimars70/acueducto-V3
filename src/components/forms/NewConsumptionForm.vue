```vue
<template>
  <div class="q-pa-sm">
    <div class="row q-col-gutter-xs">
      <!-- Año y Mes en mobile ocupan toda la fila -->
      <div class="col-6 col-sm-3 col-md-2 q-mb-xs">
        <q-select
          :model-value="formData.year"
          :options="yearOptions"
          label="Año"
          outlined
          dense
          emit-value
          map-options
          @update:model-value="value => formData.year = value"
        />
      </div>

      <div class="col-6 col-sm-3 col-md-2 q-mb-xs">
        <q-select
          :model-value="formData.mes"
          :options="months"
          label="Mes"
          outlined
          dense
          option-value="text"
          option-label="text"
          emit-value
          map-options
          @update:model-value="value => formData.mes = value"
        />
      </div>

      <!-- Fecha y Código en la misma fila en mobile -->
      <div class="col-6 col-sm-3 col-md-3 q-mb-xs">
        <q-input
          :model-value="formData.fecha"
          label="Fecha"
          outlined
          dense
          readonly
          @update:model-value="value => formData.fecha = value"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="formData.fecha"
                  mask="YYYY-MM-DD"
                  @update:model-value="value => formData.fecha = value"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <!-- Código de Instalación -->
      <div class="col-6 col-sm-3 col-md-3 q-mb-xs">
        <InstallationCodeField
          ref="codigoRef"
          @installation-found="onInstallationFound"
          v-if="mode !== 'edit'"
        />
        <ReadonlyField
          v-else
          v-model="formData.codigo"
          label="Instalación"
        />
      </div>

      <!-- Cliente -->
      <div class="col-12 col-sm-6 col-md-4 q-mb-xs">
        <ReadonlyField
          v-model="formData.cliente"
          label="Cliente"
        />
      </div>

      <!-- Sector y Medidor en la misma fila en mobile -->
      <div class="col-6 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.sector"
          label="Sector"
        />
      </div>

      <div class="col-6 col-sm-6 col-md-2 q-mb-xs">
        <ReadonlyField
          v-model="formData.medidor"
          label="Medidor"
        />
      </div>

      <!-- Dirección -->
      <div class="col-12 q-mb-xs">
        <ReadonlyField
          v-model="formData.direccion"
          label="Dirección"
        />
      </div>

      <!-- Preview de imagen capturada (solo si existe) -->
      <div v-if="capturedImage" class="col-12 q-mb-xs">
        <div class="photo-section">
          <div class="section-header q-mb-sm">
            <q-icon name="photo_camera" size="20px" color="primary" />
            <span class="section-title q-ml-sm">Foto del Medidor</span>
          </div>

          <div class="image-preview-container">
            <q-img
              :src="getDataUrl(capturedImage)"
              :ratio="16/9"
              style="border-radius: 12px; max-height: 300px;"
              fit="contain"
            >
              <div class="absolute-top-right" style="padding: 8px;">
                <q-btn
                  round
                  dense
                  color="negative"
                  icon="close"
                  size="sm"
                  @click="clearPhoto"
                />
              </div>
            </q-img>
            <div class="text-caption text-center q-mt-sm text-grey-7">
              <q-icon name="check_circle" color="positive" size="16px" />
              Foto capturada
            </div>
          </div>
        </div>
      </div>

      <!-- Lecturas y Consumo -->
      <div class="col-6 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.lectura_anterior"
          label="Lectura Anterior"
          type="number"
        />
      </div>

      <div class="col-6 col-sm-6 col-md-3 q-mb-xs">
        <q-input
          ref="lecturaActualRef"
          v-model="formData.lectura_actual"
          label="Lectura Actual"
          type="number"
          outlined
          dense
          @keyup="handleLecturaActualKeyup"
        />
      </div>

      <div class="col-6 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.consumo"
          label="Consumo"
          type="number"
          class="text-center"
          :class="{
            'bg-negative': isConsumptionOutOfRange,
            'bg-positive': !isConsumptionOutOfRange && formData.consumo !== '0'
          }"
        />
      </div>

      <div class="col-6 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.promedio"
          label="Promedio"
          type="number"
          class="text-center"
        />
      </div>

      <!-- Cobros Adicionales - Ocultos en mobile -->
      <div class="col-12 col-md-6 q-mb-xs hide-on-mobile">
        <q-input
          ref="otrosCobrosRef"
          v-model="formData.otros_cobros"
          label="Otros Cobros"
          type="number"
          outlined
          dense
          @keyup="handleOtrosCobrosKeyup"
        />
      </div>

      <div class="col-12 col-md-6 q-mb-xs hide-on-mobile">
        <q-input
          ref="reconexionRef"
          v-model="formData.reconexion"
          label="Reconexión"
          type="number"
          outlined
          dense
        />
      </div>

      <!-- Botones -->
      <div class="col-12 row justify-end q-gutter-sm q-mt-sm">
        <!-- Botón de foto (antes de Cancelar) -->
        <q-btn
          v-if="!capturedImage"
          :loading="isCapturing"
          @click="takePhoto"
          color="primary"
          icon="camera_alt"
          :label="$q.screen.xs ? '' : 'Foto'"
          outline
          class="photo-btn"
        >
          <q-tooltip v-if="$q.screen.xs">Tomar Foto</q-tooltip>
        </q-btn>

        <q-btn
          label="Cancelar"
          color="grey-7"
          outline
          icon="close"
          class="cancel-btn"
          @click="onCancel"
        />
        <q-btn
          :label="mode === 'edit' ? 'Actualizar' : 'Guardar'"
          color="primary"
          unelevated
          :icon="mode === 'edit' ? 'save' : 'save'"
          class="save-btn"
          @click="handleSave"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import InstallationCodeField from './fields/InstallationCodeField.vue';
import ReadonlyField from './fields/ReadonlyField.vue';
import { getCurrentDate, getCurrentMonth, getCurrentYear, months } from '../../utils/dates';
import { useConsumptionForm } from '../../composables/useConsumptionForm';
import { useVoiceInput } from '../../composables/useVoiceInput';
import { useCamera } from '../../composables/useCamera';

const emit = defineEmits<{
  (e: 'mounted'): void
}>();

const props = defineProps<{
  mode?: 'create' | 'edit'
}>();

const $q = useQuasar();
const router = useRouter();
const codigoRef = ref(null);
const lecturaActualRef = ref(null);
const otrosCobrosRef = ref(null);
const reconexionRef = ref(null);

const { formData, updateConsumo, saveConsumption } = useConsumptionForm(props.mode);
const { status: voiceStatus, isSupported: isVoiceSupported, isListening, toggleListening } = useVoiceInput();
const { capturedImage, isCapturing, takePhoto, clearPhoto, getDataUrl } = useCamera();

// Opciones de años
const currentYear = new Date().getFullYear();
const yearOptions = computed(() => {
  const result = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    result.push(i);
  }
  return result;
});

// Inicializar valores por defecto solo en modo create
if (props.mode !== 'edit') {
  formData.value.mes = months[getCurrentMonth() - 1].text;
  formData.value.year = getCurrentYear();
  formData.value.fecha = getCurrentDate();
}

const isConsumptionOutOfRange = computed(() => {
  const consumo = parseFloat(formData.value.consumo);
  const promedio = parseFloat(formData.value.promedio);
  
  if (isNaN(consumo) || isNaN(promedio) || promedio === 0) {
    return false;
  }

  const difference = Math.abs(consumo - promedio);
  return difference > 10;
});

// Watch para actualizar el consumo cuando cambia la lectura actual
watch(() => formData.value.lectura_actual, (newValue) => {
  if (newValue && formData.value.lectura_anterior) {
    updateConsumo(newValue);
  }
});

// Voice command handler
const handleVoiceCommand = async (command: any) => {
  console.log('Procesando comando:', command);

  switch (command.type) {
    case 'month':
      formData.value.mes = command.value;
      $q.notify({
        type: 'positive',
        message: `Mes: ${command.value}`,
        position: 'top',
        timeout: 1500
      });
      break;

    case 'code':
      // Trigger the installation code field to search for this code
      if (codigoRef.value && (codigoRef.value as any).setCode) {
        await (codigoRef.value as any).setCode(command.value);
      }
      $q.notify({
        type: 'positive',
        message: `Código: ${command.value}`,
        position: 'top',
        timeout: 1500
      });
      break;

    case 'reading':
      formData.value.lectura_actual = command.value;
      $q.notify({
        type: 'positive',
        message: `Lectura: ${command.value}`,
        position: 'top',
        timeout: 1500
      });
      break;

    case 'save':
      $q.notify({
        type: 'info',
        message: 'Guardando...',
        position: 'top',
        timeout: 1000
      });
      await handleSave();
      break;

    case 'cancel':
      onCancel();
      break;
  }
};

// Toggle voice recognition
const toggleVoice = () => {
  toggleListening(handleVoiceCommand);
};

const handleLecturaActualKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    const consumo = parseFloat(formData.value.consumo);
    if (consumo > -1) {
      otrosCobrosRef.value?.focus();
    } else {
      lecturaActualRef.value?.focus();
      $q.notify({
        type: 'negative',
        message: 'El consumo debe ser mayor a -1'
      });
    }
  }
};

const handleOtrosCobrosKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && formData.value.otros_cobros !== null) {
    reconexionRef.value?.focus();
  }
};

const onInstallationFound = async (installation: any) => {
  
  formData.value = {
    ...formData.value,
    codigo: installation.codigo.toString(),
    medidor: installation.codigo_medidor,
    cliente: installation.nombre,
    sector: installation.sector_nombre,
    direccion: installation.direccion,
    lectura_anterior: installation.lectura_anterior.toString(),
    promedio: installation.promedio.toString()
  };
  
  await nextTick();
  if (props.mode !== 'edit') {
    lecturaActualRef.value?.focus();
  }
};

const onCancel = () => {
  router.push('/consumptions');
};

const handleSave = async () => {
  const success = await saveConsumption(capturedImage.value);
  if (success) {
    if (props.mode !== 'edit') {
      codigoRef.value?.clear();
      clearPhoto(); // Limpiar foto después de guardar
      await nextTick();
      codigoRef.value?.focus();
    } else {
      router.push('/consumptions');
    }
  }
};

onMounted(() => {
  emit('mounted');
});

// Métodos expuestos para el componente padre
defineExpose({
  setFormData: (data: any) => {
    formData.value = { ...formData.value, ...data };
  },
  onInstallationFound,
  focusLecturaActual: () => {
    nextTick(() => {
      if (lecturaActualRef.value) {
        lecturaActualRef.value.focus();
      }
    });
  }
});
</script>

<style lang="scss" scoped>
.q-form {
  max-width: 1200px;
  margin: 0 auto;
}

.text-center {
  :deep() {
    .q-field__native {
      text-align: center !important;
    }
  }
}

.bg-negative {
  :deep() {
    .q-field__native {
      background-color: #ffebee !important; // Color rojo claro
      color: #d32f2f !important; // Color rojo oscuro para el texto
    }
  }
}

.bg-positive {
  :deep() {
    .q-field__native {
      background-color: #d4edda !important;
    }
  }
}

// Reduce spacing between fields
.q-mb-xs {
  margin-bottom: 4px !important;
}

.row.q-col-gutter-xs {
  margin: -2px;
  > div {
    padding: 2px;
  }
}

// Responsive visibility classes
@media (max-width: 1023px) {
  .hide-on-mobile {
    display: none;
  }
  .show-on-mobile {
    display: block;
  }
}

@media (min-width: 1024px) {
  .hide-on-mobile {
    display: block;
  }
  .show-on-mobile {
    display: none;
  }
}

// Button hover effects
.photo-btn {
  &:hover {
    background: #e3f2fd !important;
    border-color: #1976d2 !important;
    color: #1565c0 !important;
  }
}

.cancel-btn {
  &:hover {
    background: #fff4e6 !important;
    border-color: #fb923c !important;
    color: #ea580c !important;
  }
}

.save-btn {
  &:hover {
    background: #28A745 !important;
    border-color: #28A745 !important;
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4) !important;
  }
}


// Estilos para la sección de foto
.photo-section {
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
}

.section-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #2c3e50;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
}

.photo-capture-container {
  margin-top: 8px;
}

.image-preview-container {
  position: relative;
}

.modern-button {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }
}
</style>
```
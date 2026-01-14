<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { periodoNominaService } from '../services/api/periodo-nomina.service';
import type { UpdatePeriodoNominaDto, PeriodoNomina } from '../types/periodo-nomina';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const loadingData = ref(true);

const formData = ref<UpdatePeriodoNominaDto>({
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  dias_periodo: 0,
  estado: 'ABIERTO'
});

const periodoId = computed(() => Number(route.params.id));

// Calcular días automáticamente cuando cambian las fechas
const diasCalculados = computed(() => {
  if (formData.value.fecha_inicio && formData.value.fecha_fin) {
    const inicio = new Date(formData.value.fecha_inicio);
    const fin = new Date(formData.value.fecha_fin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
    return diffDays;
  }
  return 0;
});

// Actualizar días cuando cambian las fechas
const updateDias = () => {
  formData.value.dias_periodo = diasCalculados.value;
};

const loadPeriodo = async () => {
  try {
    loadingData.value = true;
    const periodo = await periodoNominaService.getPeriodo(periodoId.value);
    
    // Formatear fechas para el input type="date" (YYYY-MM-DD)
    const formatDateForInput = (date: string | Date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    formData.value = {
      nombre: periodo.nombre || '',
      fecha_inicio: formatDateForInput(periodo.fecha_inicio),
      fecha_fin: formatDateForInput(periodo.fecha_fin),
      dias_periodo: periodo.dias_periodo || 0,
      estado: periodo.estado || 'ABIERTO'
    };
  } catch (error: any) {
    console.error('Error al cargar período:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el período de nómina'
    });
    router.push('/periodos-nomina');
  } finally {
    loadingData.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.nombre || !formData.value.fecha_inicio || !formData.value.fecha_fin) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios (Nombre, Fecha Inicio y Fecha Fin)'
    });
    return;
  }

  if (new Date(formData.value.fecha_inicio) > new Date(formData.value.fecha_fin)) {
    $q.notify({
      type: 'warning',
      message: 'La fecha de inicio debe ser anterior a la fecha de fin'
    });
    return;
  }

  // Asegurar que los días estén calculados
  if (formData.value.dias_periodo === 0) {
    formData.value.dias_periodo = diasCalculados.value;
  }

  try {
    loading.value = true;
    await periodoNominaService.update(periodoId.value, formData.value);
    $q.notify({
      type: 'positive',
      message: 'Período de nómina actualizado exitosamente'
    });
    router.push('/periodos-nomina');
  } catch (error: any) {
    console.error('Error al actualizar período:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al actualizar el período de nómina';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/periodos-nomina');
};

onMounted(() => {
  loadPeriodo();
});
</script>

<template>
  <q-page class="form-page">
    <div class="form-container">
      <!-- Header -->
      <div class="form-header">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="grey-7"
          @click="handleCancel"
          class="back-btn"
        >
          <q-tooltip>Volver</q-tooltip>
        </q-btn>
        <div class="header-content">
          <q-icon name="event" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Editar Período de Nómina</h1>
            <p class="form-subtitle">Modifique la información del período de liquidación</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <q-card flat class="form-card" v-if="loadingData">
        <q-card-section class="text-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
          <div class="text-grey-7 q-mt-md">Cargando período...</div>
        </q-card-section>
      </q-card>

      <!-- Form Card -->
      <q-card flat class="form-card" v-else>
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Sección: Información del Período -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="calendar_today" size="24px" color="primary" />
              <h2 class="section-title">Información del Período</h2>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="input-wrapper">
                  <label class="input-label">Nombre del Período <span class="required">*</span></label>
                  <q-input
                    v-model="formData.nombre"
                    placeholder="Ej: Enero 2025"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="title" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Fecha de Inicio <span class="required">*</span></label>
                  <q-input
                    v-model="formData.fecha_inicio"
                    type="date"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                    @update:model-value="updateDias"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Fecha de Fin <span class="required">*</span></label>
                  <q-input
                    v-model="formData.fecha_fin"
                    type="date"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                    @update:model-value="updateDias"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Días del Período</label>
                  <q-input
                    v-model.number="formData.dias_periodo"
                    type="number"
                    outlined
                    readonly
                    class="modern-input"
                    hint="Se calcula automáticamente según las fechas"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_view_day" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Estado</label>
                  <q-select
                    v-model="formData.estado"
                    :options="['ABIERTO', 'CERRADO', 'PAGADO']"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="info" color="grey-6" />
                    </template>
                  </q-select>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <q-btn
              outline
              color="grey-7"
              icon="close"
              label="Cancelar"
              @click="handleCancel"
              :disable="loading"
              class="action-btn cancel-btn"
            />
            <q-btn
              unelevated
              color="primary"
              icon="save"
              label="Guardar"
              type="submit"
              :loading="loading"
              class="action-btn save-btn"
            />
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.form-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 24px;
}

.form-container {
  max-width: 1000px;
  margin: 0 auto;
}

.form-header {
  position: relative;
  margin-bottom: 24px;
}

.back-btn {
  position: absolute;
  top: 0;
  left: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 56px;
}

.header-text {
  flex: 1;
}

.form-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.form-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
}

.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-content {
  padding: 32px;
}

.form-section {
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.input-wrapper {
  margin-bottom: 8px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.required {
  color: #e53e3e;
}

.modern-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    height: 48px;
  }

  :deep(.q-field__prepend) {
    padding-left: 12px;
  }
}

.hint-text {
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
}

.action-btn {
  min-width: 140px;
  height: 48px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.save-btn {
  background: #3b82f6;

  &:hover {
    background: #10b981;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
}

@media (max-width: 768px) {
  .form-page {
    padding: 16px;
  }

  .form-content {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;

    .action-btn {
      width: 100%;
    }
  }
}
</style>



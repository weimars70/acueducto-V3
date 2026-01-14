<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { conceptoNominaService } from '../services/api/concepto-nomina.service';
import type { UpdateConceptoNominaDto, ConceptoNomina } from '../types/concepto-nomina';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const loadingData = ref(true);

const formData = ref<UpdateConceptoNominaDto>({
  codigo: '',
  nombre: '',
  descripcion: '',
  tipo: 'DEVENGADO',
  subtipo: '',
  formula: '',
  porcentaje: undefined,
  activo: true
});

const conceptoId = computed(() => Number(route.params.id));

const tipoOptions = ['DEVENGADO', 'DEDUCCION'];
const subtipoOptions = [
  'BASICO',
  'HORA_EXTRA_DIURNA',
  'HORA_EXTRA_FESTIVA',
  'HORA_EXTRA_NOCTURNA',
  'RECARGO_NOCTURNO',
  'DOMINICAL',
  'FESTIVO',
  'PRIMA',
  'CESANTIAS',
  'INTERESES_CESANTIAS',
  'VACACIONES',
  'SALUD',
  'PENSION',
  'ARL',
  'CAJA_COMPENSACION',
  'ICBF',
  'SENA',
  'OTRO'
];

const loadConcepto = async () => {
  try {
    loadingData.value = true;
    const concepto = await conceptoNominaService.getConcepto(conceptoId.value);
    
    formData.value = {
      codigo: concepto.codigo || '',
      nombre: concepto.nombre || '',
      descripcion: concepto.descripcion || '',
      tipo: concepto.tipo || 'DEVENGADO',
      subtipo: concepto.subtipo || '',
      formula: concepto.formula || '',
      porcentaje: concepto.porcentaje,
      activo: concepto.activo !== undefined ? concepto.activo : true
    };
  } catch (error: any) {
    console.error('Error al cargar concepto:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el concepto de nómina'
    });
    router.push('/conceptos-nomina');
  } finally {
    loadingData.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.codigo || !formData.value.nombre || !formData.value.tipo) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios (Código, Nombre y Tipo)'
    });
    return;
  }

  try {
    loading.value = true;
    await conceptoNominaService.update(conceptoId.value, formData.value);
    $q.notify({
      type: 'positive',
      message: 'Concepto de nómina actualizado exitosamente'
    });
    router.push('/conceptos-nomina');
  } catch (error: any) {
    console.error('Error al actualizar concepto:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al actualizar el concepto de nómina';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/conceptos-nomina');
};

onMounted(() => {
  loadConcepto();
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
          <q-icon name="description" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Editar Concepto de Nómina</h1>
            <p class="form-subtitle">Modifique la información del concepto</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <q-card flat class="form-card" v-if="loadingData">
        <q-card-section class="text-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
          <div class="text-grey-7 q-mt-md">Cargando concepto...</div>
        </q-card-section>
      </q-card>

      <!-- Form Card -->
      <q-card flat class="form-card" v-else>
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Sección: Información Básica -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="info" size="24px" color="primary" />
              <h2 class="section-title">Información Básica</h2>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Código <span class="required">*</span></label>
                  <q-input
                    v-model="formData.codigo"
                    placeholder="Ej: DEV001"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="tag" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Nombre <span class="required">*</span></label>
                  <q-input
                    v-model="formData.nombre"
                    placeholder="Ej: Salario Básico"
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
              <div class="col-12">
                <div class="input-wrapper">
                  <label class="input-label">Descripción</label>
                  <q-input
                    v-model="formData.descripcion"
                    type="textarea"
                    placeholder="Descripción del concepto..."
                    outlined
                    rows="3"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Configuración -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="settings" size="24px" color="primary" />
              <h2 class="section-title">Configuración</h2>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Tipo <span class="required">*</span></label>
                  <q-select
                    v-model="formData.tipo"
                    :options="tipoOptions"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="category" color="grey-6" />
                    </template>
                  </q-select>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Subtipo</label>
                  <q-select
                    v-model="formData.subtipo"
                    :options="subtipoOptions"
                    outlined
                    clearable
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="label" color="grey-6" />
                    </template>
                  </q-select>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Fórmula</label>
                  <q-input
                    v-model="formData.formula"
                    placeholder="Ej: salario_basico * 0.1"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="functions" color="grey-6" />
                    </template>
                  </q-input>
                  <div class="hint-text">Fórmula de cálculo (opcional)</div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Porcentaje (%)</label>
                  <q-input
                    v-model.number="formData.porcentaje"
                    type="number"
                    placeholder="0"
                    outlined
                    class="modern-input"
                    suffix="%"
                  >
                    <template v-slot:prepend>
                      <q-icon name="percent" color="grey-6" />
                    </template>
                  </q-input>
                  <div class="hint-text">Porcentaje a aplicar (opcional)</div>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="input-wrapper">
                  <label class="input-label">Estado</label>
                  <q-toggle
                    v-model="formData.activo"
                    label="Concepto activo"
                    color="positive"
                    class="modern-toggle"
                  />
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

.modern-toggle {
  margin-top: 8px;
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



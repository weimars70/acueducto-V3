<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { parametroNominaService } from '../services/api/parametro-nomina.service';
import type { UpdateParametroNominaDto } from '../types/parametro-nomina';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const loadingData = ref(true);

const formData = ref<UpdateParametroNominaDto>({
  codigo: '',
  nombre: '',
  descripcion: '',
  valor: 0,
  anio: new Date().getFullYear()
});

const parametroId = computed(() => Number(route.params.id));

const loadParametro = async () => {
  try {
    loadingData.value = true;
    const parametro = await parametroNominaService.getParametro(parametroId.value);

    formData.value = {
      codigo: parametro.codigo || '',
      nombre: parametro.nombre || '',
      descripcion: parametro.descripcion || '',
      valor: parametro.valor || 0,
      anio: parametro.anio || new Date().getFullYear()
    };
  } catch (error: any) {
    console.error('Error al cargar parámetro:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el parámetro de nómina'
    });
    router.push('/parametros-nomina');
  } finally {
    loadingData.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.codigo || !formData.value.nombre || !formData.value.anio) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios (Código, Nombre y Año)'
    });
    return;
  }

  if (formData.value.valor === undefined || formData.value.valor === null) {
    $q.notify({
      type: 'warning',
      message: 'El valor es obligatorio'
    });
    return;
  }

  try {
    loading.value = true;
    await parametroNominaService.update(parametroId.value, formData.value);
    $q.notify({
      type: 'positive',
      message: 'Parámetro de nómina actualizado exitosamente'
    });
    router.push('/parametros-nomina');
  } catch (error: any) {
    console.error('Error al actualizar parámetro:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al actualizar el parámetro de nómina';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/parametros-nomina');
};

onMounted(() => {
  loadParametro();
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
          <q-icon name="settings" size="40px" color="pink-7" />
          <div class="header-text">
            <h1 class="form-title">Editar Parámetro de Nómina</h1>
            <p class="form-subtitle">Modifique la información del parámetro</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <q-card flat class="form-card" v-if="loadingData">
        <q-card-section class="text-center q-pa-xl">
          <q-spinner color="pink-7" size="3em" />
          <div class="text-grey-7 q-mt-md">Cargando parámetro...</div>
        </q-card-section>
      </q-card>

      <!-- Form Card -->
      <q-card flat class="form-card" v-else>
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Sección: Información Básica -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="info" color="pink-7" size="24px" />
              <span class="section-title">Información Básica</span>
            </div>
            <div class="section-divider"></div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <label class="input-label">
                  Código <span class="required">*</span>
                </label>
                <q-input
                  v-model="formData.codigo"
                  outlined
                  dense
                  placeholder="Ej: SMMLV_2025"
                  :rules="[val => !!val || 'El código es requerido']"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="tag" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <label class="input-label">
                  Año <span class="required">*</span>
                </label>
                <q-input
                  v-model.number="formData.anio"
                  type="number"
                  outlined
                  dense
                  placeholder="Ej: 2025"
                  :rules="[
                    val => !!val || 'El año es requerido',
                    val => val > 2000 && val < 2100 || 'Ingrese un año válido'
                  ]"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_today" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <label class="input-label">
                  Nombre <span class="required">*</span>
                </label>
                <q-input
                  v-model="formData.nombre"
                  outlined
                  dense
                  placeholder="Ej: Salario Mínimo Legal Vigente"
                  :rules="[val => !!val || 'El nombre es requerido']"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="label" color="pink-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <label class="input-label">Descripción</label>
                <q-input
                  v-model="formData.descripcion"
                  outlined
                  type="textarea"
                  rows="3"
                  placeholder="Descripción opcional del parámetro..."
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" color="pink-7" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- Sección: Valor -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="attach_money" color="pink-7" size="24px" />
              <span class="section-title">Valor del Parámetro</span>
            </div>
            <div class="section-divider"></div>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <label class="input-label">
                  Valor <span class="required">*</span>
                </label>
                <q-input
                  v-model.number="formData.valor"
                  type="number"
                  step="0.01"
                  outlined
                  dense
                  placeholder="Ej: 1423500"
                  :rules="[val => val !== null && val !== undefined || 'El valor es requerido']"
                  class="modern-input"
                  hint="Ingrese el valor numérico (puede incluir decimales para porcentajes)"
                >
                  <template v-slot:prepend>
                    <q-icon name="calculate" color="pink-7" />
                  </template>
                </q-input>
                <div class="text-caption text-grey-6 q-mt-xs q-ml-sm">
                  Para porcentajes: 25.00 = 25%, para valores monetarios: 1423500 = $1,423,500
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <q-btn
              outline
              rounded
              label="Cancelar"
              color="grey-7"
              size="lg"
              class="action-btn"
              @click="handleCancel"
              :disable="loading"
            />
            <q-btn
              rounded
              type="submit"
              label="Guardar Cambios"
              color="pink-7"
              size="lg"
              class="action-btn action-btn-primary"
              :loading="loading"
              icon="save"
            />
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.form-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.form-header {
  margin-bottom: 32px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-50%) scale(1.1);
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
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  line-height: 1.2;
}

.form-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 4px 0 0 0;
}

.form-card {
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-content {
  padding: 40px;
}

.form-section {
  margin-bottom: 40px;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.section-divider {
  height: 2px;
  background: linear-gradient(to right, #f093fb, #f5576c);
  margin-bottom: 24px;
  border-radius: 2px;
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
  margin-left: 2px;
}

.modern-input {
  border-radius: 12px;
}

.modern-input :deep(.q-field__control) {
  height: 48px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.modern-input :deep(.q-field__control:focus-within) {
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
}

.modern-input :deep(textarea.q-field__native) {
  min-height: 80px !important;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  min-width: 160px;
  height: 52px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.action-btn-primary {
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.action-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 87, 108, 0.4);
}

@media (max-width: 768px) {
  .form-container {
    padding: 16px;
  }

  .form-content {
    padding: 24px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .header-content {
    margin-left: 48px;
  }
}
</style>

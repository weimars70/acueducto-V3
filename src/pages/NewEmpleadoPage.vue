<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { empleadoService } from '../services/api/empleado.service';
import type { CreateEmpleadoDto } from '../types/empleado';

const $q = useQuasar();
const router = useRouter();
const loading = ref(false);

const formData = ref<CreateEmpleadoDto>({
  cedula: '',
  nombre_completo: '',
  nombre_corto: '',
  salario_mensual: 0,
  auxilio_transporte: false,
  activo: true,
  fecha_ingreso: '',
  fecha_retiro: '',
  cargo: ''
});

const handleSubmit = async () => {
  if (!formData.value.cedula || !formData.value.nombre_completo || !formData.value.salario_mensual || !formData.value.fecha_ingreso) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios (Cédula, Nombre, Salario y Fecha de Ingreso)'
    });
    return;
  }

  try {
    loading.value = true;
    await empleadoService.create(formData.value);
    $q.notify({
      type: 'positive',
      message: 'Empleado creado exitosamente'
    });
    router.push('/empleados');
  } catch (error: any) {
    console.error('Error al crear empleado:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al crear el empleado';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/empleados');
};
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
          <q-icon name="badge" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Nuevo Empleado</h1>
            <p class="form-subtitle">Complete la información del empleado</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <q-card flat class="form-card">
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Sección: Información Personal -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="person" size="24px" color="primary" />
              <h2 class="section-title">Información Personal</h2>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Cédula <span class="required">*</span></label>
                  <q-input
                    v-model="formData.cedula"
                    placeholder="Ej: 1234567890"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-8">
                <div class="input-wrapper">
                  <label class="input-label">Nombre Completo <span class="required">*</span></label>
                  <q-input
                    v-model="formData.nombre_completo"
                    placeholder="Ej: Juan Pérez García"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Nombre Corto</label>
                  <q-input
                    v-model="formData.nombre_corto"
                    placeholder="Ej: Juan Pérez"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="short_text" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Cargo</label>
                  <q-input
                    v-model="formData.cargo"
                    placeholder="Ej: Operario"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="work" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Información Laboral -->
          <div class="form-section">
            <div class="section-header">
              <q-icon name="work" size="24px" color="primary" />
              <h2 class="section-title">Información Laboral</h2>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Salario Mensual <span class="required">*</span></label>
                  <q-input
                    v-model.number="formData.salario_mensual"
                    type="number"
                    placeholder="0"
                    outlined
                    :rules="[val => val > 0 || 'Debe ser mayor a 0']"
                    class="modern-input"
                    prefix="$"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_money" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Fecha de Ingreso <span class="required">*</span></label>
                  <q-input
                    v-model="formData.fecha_ingreso"
                    type="date"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_today" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Fecha de Retiro</label>
                  <q-input
                    v-model="formData.fecha_retiro"
                    type="date"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event_busy" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Auxilio de Transporte</label>
                  <q-toggle
                    v-model="formData.auxilio_transporte"
                    label="Recibe auxilio de transporte"
                    color="primary"
                    class="modern-toggle"
                  />
                  <div class="hint-text">Aplica si el salario es <= 2 SMMLV</div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Estado</label>
                  <q-toggle
                    v-model="formData.activo"
                    label="Empleado activo"
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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { terceroService } from '../services/api/tercero.service';
import type { CreateTerceroDto } from '../types/tercero';
import { useAuthStore } from '../stores/auth';
import { apiClient } from '../services/api/client';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

// Opciones para selects
const ciudades = ref<any[]>([]);
const regimenes = ref<any[]>([]);
const tiposIdent = ref<any[]>([]);
const tiposImpuesto = ref<any[]>([]);

const formData = ref<CreateTerceroDto>({
  empresaId: authStore.user?.empresaId || 0,
  ciudadCodigo: '',
  nombre: '',
  identificacion: '',
  dv: undefined,
  nombres: '',
  primerApellido: '',
  segundoApellido: '',
  direccion: '',
  telefono: '',
  email: '',
  regimen: undefined,
  tipoIdent: undefined,
  tipoImpuesto: undefined,
  cliente: false,
  proveedor: false,
  activo: true,
  usuario: authStore.user?.email || ''
});

const loadSelectOptions = async () => {
  try {
    const empresaId = authStore.user?.empresaId;
    
    // Cargar ciudades
    const ciudadesResp = await apiClient.get('/terceros/select/ciudades', { params: { empresaId } });
    ciudades.value = ciudadesResp.data.map((c: any) => ({ label: c.nombre, value: c.codigo }));
    
    // Cargar regímenes
    const regimenesResp = await apiClient.get('/terceros/select/tipo-regimen', { params: { empresaId } });
    regimenes.value = regimenesResp.data.map((r: any) => ({ label: r.nombre, value: r.codigo }));
    
    // Cargar tipos de identificación
    const tiposIdentResp = await apiClient.get('/terceros/select/tipo-ident', { params: { empresaId } });
    tiposIdent.value = tiposIdentResp.data.map((t: any) => ({ label: t.nombre, value: t.codigo }));
    
    // Cargar tipos de impuesto
    const tiposImpuestoResp = await apiClient.get('/terceros/select/tipo-impuesto', { params: { empresaId } });
    tiposImpuesto.value = tiposImpuestoResp.data.map((t: any) => ({ label: t.nombre, value: t.codigo }));
    
  } catch (error) {
    console.error('Error cargando opciones:', error);
    $q.notify({
      type: 'warning',
      message: 'Algunas opciones no se pudieron cargar'
    });
  }
};

const handleSubmit = async () => {
  if (!formData.value.nombre || !formData.value.ciudadCodigo) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios (Nombre y Ciudad)'
    });
    return;
  }

  try {
    loading.value = true;
    await terceroService.create(formData.value);
    $q.notify({
      type: 'positive',
      message: 'Tercero creado exitosamente'
    });
    router.push('/terceros');
  } catch (error: any) {
    console.error('Error al crear tercero:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al crear el tercero';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/terceros');
};

onMounted(() => {
  loadSelectOptions();
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
          <q-icon name="person_add" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Nuevo Tercero</h1>
            <p class="form-subtitle">Complete la información del tercero (cliente/proveedor)</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <q-card flat class="form-card">
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Información Básica -->
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <div class="input-wrapper">
                  <label class="input-label">Nombre Completo <span class="required">*</span></label>
                  <q-input
                    v-model="formData.nombre"
                    placeholder="Nombre completo del tercero"
                    outlined
                    dense
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Ciudad <span class="required">*</span></label>
                  <q-select
                    v-model="formData.ciudadCodigo"
                    :options="ciudades"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Seleccione ciudad"
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="location_city" color="grey-6" size="20px" />
                    </template>
                  </q-select>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <div class="input-wrapper">
                  <label class="input-label">Tipo Identificación</label>
                  <q-select
                    v-model="formData.tipoIdent"
                    :options="tiposIdent"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Tipo"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" color="grey-6" size="20px" />
                    </template>
                  </q-select>
                </div>
              </div>

              <div class="col-12 col-md-5">
                <div class="input-wrapper">
                  <label class="input-label">Identificación</label>
                  <q-input
                    v-model="formData.identificacion"
                    placeholder="Número de identificación"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="fingerprint" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">DV</label>
                  <q-input
                    v-model.number="formData.dv"
                    type="number"
                    placeholder="0-9"
                    outlined
                    dense
                    class="modern-input"
                  />
                </div>
              </div>

              <div class="col-12 col-md-2">
                <div class="input-wrapper">
                  <label class="input-label">Email</label>
                  <q-input
                    v-model="formData.email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Nombres y Apellidos -->
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Nombres</label>
                  <q-input
                    v-model="formData.nombres"
                    placeholder="Nombres"
                    outlined
                    dense
                    class="modern-input"
                  />
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Primer Apellido</label>
                  <q-input
                    v-model="formData.primerApellido"
                    placeholder="Primer apellido"
                    outlined
                    dense
                    class="modern-input"
                  />
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Segundo Apellido</label>
                  <q-input
                    v-model="formData.segundoApellido"
                    placeholder="Segundo apellido"
                    outlined
                    dense
                    class="modern-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Información de Contacto -->
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <div class="input-wrapper">
                  <label class="input-label">Dirección</label>
                  <q-input
                    v-model="formData.direccion"
                    placeholder="Dirección completa"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="home" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Teléfono</label>
                  <q-input
                    v-model="formData.telefono"
                    placeholder="Número de teléfono"
                    outlined
                    dense
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Tributaria -->
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Régimen</label>
                  <q-select
                    v-model="formData.regimen"
                    :options="regimenes"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Seleccione régimen"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" color="grey-6" size="20px" />
                    </template>
                  </q-select>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Tipo de Impuesto</label>
                  <q-select
                    v-model="formData.tipoImpuesto"
                    :options="tiposImpuesto"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Seleccione tipo"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="percent" color="grey-6" size="20px" />
                    </template>
                  </q-select>
                </div>
              </div>
            </div>
          </div>

          <!-- Clasificación -->
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <q-checkbox
                  v-model="formData.cliente"
                  label="Es Cliente"
                  color="primary"
                  class="modern-checkbox"
                />
              </div>

              <div class="col-12 col-md-3">
                <q-checkbox
                  v-model="formData.proveedor"
                  label="Es Proveedor"
                  color="secondary"
                  class="modern-checkbox"
                />
              </div>

              <div class="col-12 col-md-3">
                <q-toggle
                  v-model="formData.activo"
                  label="Activo"
                  color="positive"
                  class="modern-toggle"
                />
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <q-btn
              outline
              label="Cancelar"
              color="grey-7"
              class="action-btn cancel-btn"
              @click="handleCancel"
              :disable="loading"
              icon="close"
            />
            <q-btn
              unelevated
              label="Guardar Tercero"
              type="submit"
              color="primary"
              class="action-btn save-btn"
              :loading="loading"
              icon="save"
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
  max-width: 1400px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 16px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 8px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-left: 60px;
}

.header-text {
  flex: 1;
}

.form-title {
  margin: 0;
  font-size: 26px;
  font-weight: 500;
  color: #1a202c;
  line-height: 1.2;
}

.form-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
  font-weight: 400;
}

.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-content {
  padding: 32px;
}

.form-section {
  margin-bottom: 24px;

  &:last-of-type {
    margin-bottom: 16px;
  }
}

.input-wrapper {
  margin-bottom: 0;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.required {
  color: #e53e3e;
  font-weight: 600;
}

.modern-input {
  :deep(.q-field__control) {
    border-radius: 10px;
    height: 40px;
    min-height: 40px;
    background: #fafafa;
    transition: all 0.3s ease;

    &:before {
      border-color: #e2e8f0;
    }

    &:hover:before {
      border-color: #cbd5e0;
    }
  }

  :deep(.q-field__control--focused) {
    background: white;

    &:before {
      border-color: #3b82f6 !important;
      border-width: 2px !important;
    }
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    font-size: 14px;
    color: #2d3748;
    font-weight: 500;
  }

  :deep(.q-field__prepend) {
    padding-right: 8px;
  }
  
  :deep(.q-icon) {
    font-size: 20px;
  }
}

.modern-checkbox,
.modern-toggle {
  :deep(.q-checkbox__label),
  :deep(.q-toggle__label) {
    font-size: 14px;
    font-weight: 500;
    color: #2d3748;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  min-width: 120px;
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.2px;
  transition: all 0.3s ease;
}

.cancel-btn {
  &:hover {
    background: #fff4e6 !important;
    border-color: #fb923c !important;
    color: #ea580c !important;
  }
}

.save-btn {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    background: #28A745 !important;
    border-color: #28A745 !important;
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4) !important;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .form-page {
    padding: 16px;
  }

  .form-content {
    padding: 24px;
  }

  .form-title {
    font-size: 22px;
  }

  .form-subtitle {
    font-size: 13px;
  }

  .header-content {
    padding-left: 50px;
  }

  .form-actions {
    flex-direction: column;

    .action-btn {
      width: 100%;
    }
  }
}
</style>

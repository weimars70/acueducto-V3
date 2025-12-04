<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { ciudadService } from '../services/api/ciudad.service';
import type { UpdateCiudadDto } from '../types/ciudad';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const loadingData = ref(true);
const codigoCiudad = ref<string>(route.params.codigo as string);
const codigoOriginal = ref<string>('');

const formData = ref<UpdateCiudadDto & { codigo?: string }>({
  nombre: '',
  usuario: authStore.user?.email || ''
});

const loadCiudad = async () => {
  try {
    loadingData.value = true;
    const ciudad = await ciudadService.getByCodigo(codigoCiudad.value);
    codigoOriginal.value = ciudad.codigo;
    formData.value = {
      codigo: ciudad.codigo,
      nombre: ciudad.nombre,
      usuario: authStore.user?.email || ''
    };
  } catch (error) {
    console.error('Error al cargar ciudad:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos de la ciudad'
    });
    router.push('/ciudades');
  } finally {
    loadingData.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.nombre) {
    $q.notify({
      type: 'warning',
      message: 'Por favor ingrese el nombre de la ciudad'
    });
    return;
  }

  try {
    loading.value = true;
    await ciudadService.update(codigoOriginal.value, {
      nombre: formData.value.nombre,
      usuario: formData.value.usuario
    });
    $q.notify({
      type: 'positive',
      message: 'Ciudad actualizada exitosamente'
    });
    router.push('/ciudades');
  } catch (error: any) {
    console.error('Error al actualizar ciudad:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al actualizar la ciudad';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/ciudades');
};

onMounted(() => {
  loadCiudad();
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
          <q-icon name="location_city" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Editar Ciudad</h1>
            <p class="form-subtitle">Modifique la información de la ciudad</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <q-card v-if="loadingData" flat class="form-card">
        <q-card-section class="loading-section">
          <q-spinner color="primary" size="3em" />
          <div class="loading-text">Cargando datos de la ciudad...</div>
        </q-card-section>
      </q-card>

      <!-- Form Card -->
      <q-card v-else flat class="form-card">
        <q-form @submit="handleSubmit" class="form-content">
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Código</label>
                  <q-input
                    v-model="formData.codigo"
                    outlined
                    readonly
                    disable
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="tag" color="grey-6" />
                    </template>
                  </q-input>
                  <div class="field-hint">El código no puede ser modificado</div>
                </div>
              </div>
              <div class="col-12 col-md-8">
                <div class="input-wrapper">
                  <label class="input-label">Nombre <span class="required">*</span></label>
                  <q-input
                    v-model="formData.nombre"
                    placeholder="Ej: Bogotá"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="location_city" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
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
              label="Actualizar"
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
  max-width: 900px;
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
  padding: 20px 32px;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: #718096;
  font-weight: 400;
}

.form-section {
  margin-bottom: 16px;
}

.input-wrapper {
  margin-bottom: 4px;
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

.field-hint {
  margin-top: 4px;
  font-size: 11px;
  color: #718096;
  font-style: italic;
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
    padding-right: 10px;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  min-width: 110px;
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 13px;
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
    font-size: 24px;
  }

  .form-subtitle {
    font-size: 14px;
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

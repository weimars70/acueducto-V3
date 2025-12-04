<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { marcaMedidorService } from '../services/api/marca-medidor.service';
import { useAuthStore } from '../stores/auth';
import type { CreateMarcaMedidorDto } from '../types/marca-medidor';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const loading = ref(false);

const form = ref<CreateMarcaMedidorDto>({
  nombre: '',
  empresa_id: authStore.user?.empresaId || 1,
  usuario: authStore.user?.email || ''
});

const handleSubmit = async () => {
  try {
    loading.value = true;
    await marcaMedidorService.create(form.value);
    $q.notify({
      type: 'positive',
      message: 'Marca de medidor creada exitosamente'
    });
    router.push('/marcas-medidor');
  } catch (error) {
    console.error('Error al crear marca de medidor:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al crear la marca de medidor'
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/marcas-medidor');
};
</script>

<template>
  <q-page class="page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="speed" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Nueva Marca de Medidor</h1>
              <p class="page-subtitle">Crear una nueva marca de medidor</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <q-card flat class="form-card">
        <q-form @submit="handleSubmit">
          <q-card-section>
            <!-- Información de la Marca -->
            <div class="form-section">
              <div class="section-header">
                <q-icon name="speed" size="24px" color="primary" />
                <span class="section-title">Información de la Marca</span>
              </div>

              <div class="form-grid">
                <div class="form-field full-width">
                  <label class="field-label">
                    Nombre <span class="required">*</span>
                  </label>
                  <q-input
                    v-model="form.nombre"
                    outlined
                    dense
                    placeholder="Ingrese el nombre de la marca"
                    :rules="[val => !!val || 'Requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="speed" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions class="form-actions">
            <q-btn
              flat
              label="Cancelar"
              color="grey-7"
              @click="handleCancel"
              class="cancel-btn"
            />
            <q-btn
              unelevated
              type="submit"
              label="Crear Marca"
              color="primary"
              :loading="loading"
              class="submit-btn"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 24px;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
}

.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.form-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  letter-spacing: 0.3px;
}

.required {
  color: #e53e3e;
}

.modern-input {
  :deep(.q-field__control) {
    height: 48px;
    border-radius: 12px;
  }

  :deep(.q-field__native) {
    font-size: 14px;
  }
}

.form-actions {
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8f9fa;
}

.cancel-btn {
  min-width: 120px;
  height: 42px;
  font-weight: 500;
  border-radius: 10px;
}

.submit-btn {
  min-width: 160px;
  height: 42px;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }
}

@media (max-width: 768px) {
  .page {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;

    .cancel-btn,
    .submit-btn {
      width: 100%;
    }
  }
}
</style>

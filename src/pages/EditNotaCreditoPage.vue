<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { notaCreditoService } from '../services/api/nota-credito.service';
import { useAuthStore } from '../stores/auth';
import type { UpdateNotaCreditoDto } from '../types/nota-credito';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const loadingData = ref(true);
const formData = ref<UpdateNotaCreditoDto>({
  instalacionCodigo: 0,
  clienteNombre: '',
  fecha: '',
  valor: 0,
  disponible: 0,
  concepto: undefined,
  observacion: '',
  empresaId: 1,
  usuario: authStore.user?.email || ''
});

const codigo = ref<number>(0);
const empresaId = ref<number>(0);

const loadNotaCredito = async () => {
  try {
    loadingData.value = true;
    codigo.value = Number(route.params.codigo);
    empresaId.value = Number(route.params.empresaId);

    const data = await notaCreditoService.getOne(codigo.value, empresaId.value);

    formData.value = {
      instalacionCodigo: data.instalacionCodigo,
      clienteNombre: data.clienteNombre,
      fecha: data.fecha,
      valor: data.valor,
      disponible: data.disponible,
      concepto: data.concepto,
      observacion: data.observacion,
      empresaId: data.empresaId,
      usuario: data.usuario
    };
  } catch (error) {
    console.error('Error al cargar nota de crédito:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar la nota de crédito' });
    router.push('/notas-credito');
  } finally {
    loadingData.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.instalacionCodigo) {
    $q.notify({ type: 'warning', message: 'El código de instalación es obligatorio' });
    return;
  }

  if (!formData.value.valor || formData.value.valor <= 0) {
    $q.notify({ type: 'warning', message: 'El valor debe ser mayor a cero' });
    return;
  }

  try {
    loading.value = true;
    await notaCreditoService.update(codigo.value, empresaId.value, formData.value);
    $q.notify({ type: 'positive', message: 'Nota de crédito actualizada exitosamente' });
    router.push('/notas-credito');
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Error al actualizar la nota de crédito' });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/notas-credito');
};

onMounted(() => {
  loadNotaCredito();
});
</script>

<template>
  <q-page class="edit-nota-credito-page">
    <div class="page-container">
      <div class="row justify-center">
        <div class="col-12 col-md-10 col-lg-8">
          <!-- Header -->
          <div class="page-header">
            <q-btn
              flat
              round
              icon="arrow_back"
              color="primary"
              @click="handleCancel"
              class="q-mr-md"
            />
            <div class="header-content">
              <div class="title-section">
                <q-icon name="edit_note" size="32px" color="primary" class="q-mr-sm" />
                <div>
                  <h1 class="page-title">Editar Nota de Crédito #{{ codigo }}</h1>
                  <p class="page-subtitle">Modifique la información de la nota de crédito</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <q-card v-if="loadingData" class="form-card">
            <q-card-section class="q-pa-xl text-center">
              <q-spinner-dots size="50px" color="primary" />
              <p class="text-grey-7 q-mt-md">Cargando información...</p>
            </q-card-section>
          </q-card>

          <!-- Form -->
          <q-card v-else class="form-card">
            <q-form @submit="handleSubmit">
              <q-card-section class="q-pa-lg">
                <!-- Información General -->
                <div class="section-header">
                  <q-icon name="info" size="24px" color="primary" />
                  <span class="section-title">Información General</span>
                </div>
                <q-separator class="q-mb-md" />

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <label class="field-label">Código de Instalación <span class="text-negative">*</span></label>
                    <q-input
                      outlined
                      dense
                      v-model.number="formData.instalacionCodigo"
                      type="number"
                      placeholder="Ingrese el código de instalación"
                      :rules="[val => !!val && val > 0 || 'El código de instalación es requerido']"
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="home" color="grey-6" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="field-label">Nombre del Cliente</label>
                    <q-input
                      outlined
                      dense
                      v-model="formData.clienteNombre"
                      placeholder="Ingrese el nombre del cliente"
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="grey-6" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="field-label">Fecha</label>
                    <q-input
                      outlined
                      dense
                      v-model="formData.fecha"
                      type="date"
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="event" color="grey-6" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="field-label">Concepto</label>
                    <q-input
                      outlined
                      dense
                      v-model.number="formData.concepto"
                      type="number"
                      placeholder="Código del concepto"
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="category" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- Valores -->
                <div class="section-header q-mt-lg">
                  <q-icon name="attach_money" size="24px" color="primary" />
                  <span class="section-title">Valores</span>
                </div>
                <q-separator class="q-mb-md" />

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <label class="field-label">Valor Total <span class="text-negative">*</span></label>
                    <q-input
                      outlined
                      dense
                      v-model.number="formData.valor"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      :rules="[val => !!val && val > 0 || 'El valor debe ser mayor a cero']"
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="monetization_on" color="grey-6" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="field-label">Valor Disponible</label>
                    <q-input
                      outlined
                      dense
                      v-model.number="formData.disponible"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="account_balance_wallet" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- Observaciones -->
                <div class="section-header q-mt-lg">
                  <q-icon name="notes" size="24px" color="primary" />
                  <span class="section-title">Observaciones</span>
                </div>
                <q-separator class="q-mb-md" />

                <div class="row">
                  <div class="col-12">
                    <q-input
                      outlined
                      v-model="formData.observacion"
                      type="textarea"
                      rows="4"
                      placeholder="Ingrese observaciones adicionales..."
                      class="modern-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="description" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>

              <!-- Actions -->
              <q-separator />
              <q-card-actions class="q-pa-lg bg-grey-1">
                <div class="row full-width q-gutter-sm justify-end">
                  <q-btn
                    outline
                    color="grey-7"
                    label="Cancelar"
                    icon="close"
                    @click="handleCancel"
                    :disable="loading"
                    class="action-button"
                    no-caps
                  />
                  <q-btn
                    unelevated
                    type="submit"
                    color="primary"
                    label="Actualizar"
                    icon="save"
                    :loading="loading"
                    class="action-button"
                    no-caps
                  />
                </div>
              </q-card-actions>
            </q-form>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.edit-nota-credito-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.header-content {
  flex: 1;
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
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.modern-input {
  :deep(.q-field__control) {
    height: 48px;
    border-radius: 12px;
  }

  :deep(.q-field__control:hover) {
    border-color: #3b82f6;
  }

  :deep(.q-field__native) {
    font-size: 14px;
    color: #2d3748;
  }
}

.action-button {
  min-width: 140px;
  height: 44px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .page-title {
    font-size: 22px;
  }

  .action-button {
    width: 100%;
  }
}
</style>

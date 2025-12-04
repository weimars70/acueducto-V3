<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { bancoService } from '../services/api/banco.service';
import { tipoCuentaService, type TipoCuenta } from '../services/api/tipo-cuenta.service';
import type { UpdateBancoDto, Banco } from '../types/banco';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const loadingData = ref(true);
const bancoId = ref<number>(parseInt(route.params.id as string));
const tiposCuenta = ref<TipoCuenta[]>([]);
const loadingTiposCuenta = ref(false);

const formData = ref<UpdateBancoDto>({
  codigo: '',
  nombre: '',
  numero_cuenta: '',
  titular: '',
  nit_titular: '',
  entidad_financiera: '',
  moneda: 'COP',
  centro_costo_id: undefined,
  cuenta_contable: '',
  activa: true,
  observaciones: '',
  tipo_cuenta: 1
});

const monedas = [
  { label: 'Peso Colombiano (COP)', value: 'COP' },
  { label: 'Dólar (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' }
];

const loadTiposCuenta = async () => {
  try {
    loadingTiposCuenta.value = true;
    const empresaId = authStore.user?.empresaId || 1;
    const allTipos = await tipoCuentaService.getByEmpresa(empresaId);
    tiposCuenta.value = allTipos;
  } catch (error: any) {
    console.error('Error al cargar tipos de cuenta:', error);
    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar los tipos de cuenta disponibles'
    });
  } finally {
    loadingTiposCuenta.value = false;
  }
};

const loadBanco = async () => {
  try {
    loadingData.value = true;
    const banco = await bancoService.getById(bancoId.value);
    formData.value = {
      codigo: banco.codigo,
      nombre: banco.nombre,
      numero_cuenta: banco.numero_cuenta,
      titular: banco.titular,
      nit_titular: banco.nit_titular,
      entidad_financiera: banco.entidad_financiera,
      moneda: banco.moneda,
      centro_costo_id: banco.centro_costo_id,
      cuenta_contable: banco.cuenta_contable,
      activa: banco.activa,
      observaciones: banco.observaciones,
      tipo_cuenta: banco.tipo_cuenta
    };
  } catch (error) {
    console.error('Error al cargar banco:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos del banco'
    });
    router.push('/bancos');
  } finally {
    loadingData.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.codigo || !formData.value.nombre || !formData.value.numero_cuenta) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete los campos obligatorios'
    });
    return;
  }

  try {
    loading.value = true;
    const dataToUpdate = {
      ...formData.value,
      usuario: authStore.user?.email || ''
    };
    await bancoService.update(bancoId.value, dataToUpdate);
    $q.notify({
      type: 'positive',
      message: 'Banco actualizado exitosamente'
    });
    router.push('/bancos');
  } catch (error: any) {
    console.error('Error al actualizar banco:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al actualizar el banco';
    $q.notify({
      type: 'negative',
      message
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/bancos');
};

onMounted(() => {
  loadTiposCuenta();
  loadBanco();
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
          <q-icon name="account_balance" size="40px" color="primary" />
          <div class="header-text">
            <h1 class="form-title">Editar Banco</h1>
            <p class="form-subtitle">Modifique la información de la cuenta bancaria</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <q-card v-if="loadingData" flat class="form-card">
        <q-card-section class="loading-section">
          <q-spinner color="primary" size="3em" />
          <div class="loading-text">Cargando datos del banco...</div>
        </q-card-section>
      </q-card>

      <!-- Form Card -->
      <q-card v-else flat class="form-card">
        <q-form @submit="handleSubmit" class="form-content">
          <!-- Sección: Información Básica -->
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Código <span class="required">*</span></label>
                  <q-input
                    v-model="formData.codigo"
                    placeholder="Ej: BCO001"
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
              <div class="col-12 col-md-8">
                <div class="input-wrapper">
                  <label class="input-label">Nombre del Banco <span class="required">*</span></label>
                  <q-input
                    v-model="formData.nombre"
                    placeholder="Ej: Banco Ejemplo S.A."
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="account_balance" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Datos de la Cuenta -->
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Número de Cuenta <span class="required">*</span></label>
                  <q-input
                    v-model="formData.numero_cuenta"
                    placeholder="Ingrese el número de cuenta"
                    outlined
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="numbers" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Entidad Financiera</label>
                  <q-input
                    v-model="formData.entidad_financiera"
                    placeholder="Ej: Bancolombia"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="business" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Moneda</label>
                  <q-select
                    v-model="formData.moneda"
                    :options="monedas"
                    outlined
                    emit-value
                    map-options
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="monetization_on" color="grey-6" />
                    </template>
                  </q-select>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Tipo de Cuenta <span class="required">*</span></label>
                  <q-select
                    v-model="formData.tipo_cuenta"
                    :options="tiposCuenta"
                    option-value="id"
                    option-label="nombre"
                    emit-value
                    map-options
                    outlined
                    :loading="loadingTiposCuenta"
                    :rules="[val => !!val || 'Campo requerido']"
                    class="modern-input"
                    placeholder="Seleccione un tipo"
                  >
                    <template v-slot:prepend>
                      <q-icon name="category" color="grey-6" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay tipos de cuenta
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">Estado</label>
                  <div class="toggle-wrapper">
                    <q-toggle
                      v-model="formData.activa"
                      label="Cuenta Activa"
                      color="positive"
                      size="lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Titular -->
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <div class="input-wrapper">
                  <label class="input-label">Titular</label>
                  <q-input
                    v-model="formData.titular"
                    placeholder="Nombre completo del titular"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="input-wrapper">
                  <label class="input-label">NIT/Documento</label>
                  <q-input
                    v-model="formData.nit_titular"
                    placeholder="NIT o cédula"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="fingerprint" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Información Contable -->
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Cuenta Contable</label>
                  <q-input
                    v-model="formData.cuenta_contable"
                    placeholder="Código de cuenta contable"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="receipt_long" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-wrapper">
                  <label class="input-label">Centro de Costo</label>
                  <q-input
                    v-model.number="formData.centro_costo_id"
                    type="number"
                    placeholder="ID del centro de costo"
                    outlined
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="account_tree" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Observaciones -->
          <div class="form-section">
            <div class="input-wrapper">
              <label class="input-label">Observaciones</label>
              <q-input
                v-model="formData.observaciones"
                type="textarea"
                placeholder="Agregue cualquier nota o comentario adicional..."
                outlined
                rows="4"
                class="modern-input"
              />
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
              label="Actualizar Banco"
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

  &:last-of-type {
    margin-bottom: 12px;
  }
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

  :deep(textarea) {
    min-height: 80px;
    resize: vertical;
  }
}

.toggle-wrapper {
  height: 40px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
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

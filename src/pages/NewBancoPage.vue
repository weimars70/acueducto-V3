<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { bancoService } from '../services/api/banco.service';
import type { CreateBancoDto } from '../types/banco';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const formData = ref<CreateBancoDto>({
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
  creado_por: authStore.user?.username || '',
  tipo_cuenta: 1,
  usuario: authStore.user?.email || ''
});

const monedas = [
  { label: 'Peso Colombiano (COP)', value: 'COP' },
  { label: 'Dólar (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' }
];

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
    await bancoService.create(formData.value);
    $q.notify({
      type: 'positive',
      message: 'Banco creado exitosamente'
    });
    router.push('/bancos');
  } catch (error: any) {
    console.error('Error al crear banco:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al crear el banco';
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
</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h5 q-mb-md">Nuevo Banco</div>

      <q-card>
        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <!-- Fila 1: Código, Nombre -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="formData.codigo"
                  label="Código *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                />
              </div>
              <div class="col-12 col-md-9">
                <q-input
                  v-model="formData.nombre"
                  label="Nombre *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                />
              </div>
            </div>

            <!-- Fila 2: Número de Cuenta, Entidad Financiera -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.numero_cuenta"
                  label="Número de Cuenta *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.entidad_financiera"
                  label="Entidad Financiera"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Fila 3: Titular, NIT Titular -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <q-input
                  v-model="formData.titular"
                  label="Titular"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.nit_titular"
                  label="NIT Titular"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Fila 4: Moneda, Cuenta Contable, Centro Costo -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="formData.moneda"
                  :options="monedas"
                  label="Moneda"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.cuenta_contable"
                  label="Cuenta Contable"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="formData.centro_costo_id"
                  label="Centro de Costo ID"
                  type="number"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Fila 5: Tipo Cuenta, Estado -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formData.tipo_cuenta"
                  label="Tipo de Cuenta *"
                  type="number"
                  outlined
                  dense
                  :rules="[val => !!val || 'Campo requerido']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="formData.activa"
                  label="Cuenta Activa"
                  color="positive"
                />
              </div>
            </div>

            <!-- Fila 6: Observaciones -->
            <div class="row">
              <div class="col-12">
                <q-input
                  v-model="formData.observaciones"
                  label="Observaciones"
                  type="textarea"
                  outlined
                  rows="3"
                />
              </div>
            </div>

            <!-- Botones -->
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-md-6">
                <q-btn
                  label="Cancelar"
                  color="grey"
                  class="full-width"
                  @click="handleCancel"
                  :disable="loading"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-btn
                  label="Guardar"
                  type="submit"
                  color="primary"
                  class="full-width"
                  :loading="loading"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>

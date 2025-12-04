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
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h5 q-mb-md">Editar Banco</div>

      <q-card>
        <q-card-section v-if="loadingData" class="text-center">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md">Cargando datos...</div>
        </q-card-section>

        <q-card-section v-else>
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
                <q-select
                  v-model="formData.tipo_cuenta"
                  :options="tiposCuenta"
                  option-value="id"
                  option-label="nombre"
                  emit-value
                  map-options
                  label="Tipo de Cuenta *"
                  outlined
                  dense
                  :loading="loadingTiposCuenta"
                  :rules="[val => !!val || 'Campo requerido']"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No hay tipos de cuenta
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
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
                  label="Guardar Cambios"
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

<style scoped lang="scss">
.q-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 24px;

  :deep(.q-page__container) {
    max-width: 1400px;
    margin: 0 auto;
  }
}
</style>

<template>
  <q-page padding>
    <div style="max-width: 1400px; margin: 0 auto;">
      <!-- Encabezado -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h4 style="margin: 0; font-weight: 700; color: #1f2937;">RECIBO CAJA</h4>
        <div style="font-size: 18px; font-weight: 600; color: #6b7280;">
          {{ new Date().toLocaleDateString('es-CO') }}
        </div>
      </div>

      <!-- Formulario -->
      <q-card flat bordered style="border-radius: 12px; overflow: hidden;">
        <q-card-section>
          <!-- Primera fila: Fecha, Instalación, Nombre, Factura -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-2">
              <label class="field-label">Fecha *</label>
              <q-input
                v-model="formData.fecha"
                filled
                dense
                type="date"
                :rules="[val => !!val || 'Campo requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Instalación</label>
              <q-input
                v-model="formData.instalacion"
                filled
                dense
                readonly
                bg-color="grey-2"
              />
            </div>

            <div class="col-12 col-md-5">
              <label class="field-label">Nombre</label>
              <q-input
                v-model="formData.nombre"
                filled
                dense
                readonly
                bg-color="grey-2"
              />
            </div>

            <div class="col-12 col-md-3">
              <label class="field-label">Factura</label>
              <q-input
                v-model="formData.factura"
                filled
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
          </div>

          <!-- Segunda fila: Tipo, Valor, Valor Abono, Forma Pago, Documento -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-3">
              <label class="field-label">Tipo *</label>
              <q-select
                v-model="formData.tipo"
                :options="tiposRecibo"
                option-label="nombre"
                option-value="codigo"
                filled
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Campo requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Valor</label>
              <q-input
                v-model="formData.valor"
                filled
                dense
                readonly
                bg-color="grey-2"
                prefix="$"
              />
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Valor Abono *</label>
              <q-input
                v-model="formData.valorAbono"
                filled
                dense
                type="number"
                prefix="$"
                :rules="[val => !!val || 'Campo requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="payments" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-3">
              <label class="field-label">Forma Pago *</label>
              <q-select
                v-model="formData.formaPago"
                :options="formasPago"
                option-label="descripcion"
                option-value="codigo"
                filled
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Campo requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="credit_card" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
              <label class="field-label">Documento</label>
              <q-input
                v-model="formData.documento"
                filled
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="description" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="q-mb-md">
            <label class="field-label">Observaciones</label>
            <q-input
              v-model="formData.observaciones"
              filled
              type="textarea"
              rows="4"
              dense
            />
          </div>

          <!-- Botones -->
          <div style="display: flex; justify-content: center; gap: 16px; margin-top: 32px;">
            <q-btn
              label="Guardar"
              icon="check"
              color="primary"
              size="lg"
              style="min-width: 150px; border-radius: 8px;"
              @click="guardar"
              :loading="loading"
            />
            <q-btn
              label="Volver"
              icon="arrow_back"
              color="grey-7"
              size="lg"
              style="min-width: 150px; border-radius: 8px;"
              flat
              @click="volver"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { recibosCajaService, type TipoRecibo, type FormaPago } from '../services/api/recibos-caja.service';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const tiposRecibo = ref<TipoRecibo[]>([]);
const formasPago = ref<FormaPago[]>([]);

const formData = ref({
  fecha: new Date().toISOString().split('T')[0],
  instalacion: '',
  nombre: '',
  factura: '',
  tipo: null as number | null,
  valor: '',
  valorAbono: '',
  formaPago: null as number | null,
  documento: '',
  observaciones: ''
});

const loadCatalogos = async () => {
  try {
    loading.value = true;
    const [tipos, formas] = await Promise.all([
      recibosCajaService.getTiposRecibo(),
      recibosCajaService.getFormasPago()
    ]);
    tiposRecibo.value = tipos;
    formasPago.value = formas;
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los catálogos: ' + error.message,
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const setTipoFromQuery = () => {
  const tipoNombre = route.query.tipo_nombre as string;
  if (tipoNombre && tiposRecibo.value.length > 0) {
    // Buscar coincidencia insensible a mayúsculas/minúsculas
    const tipoEncontrado = tiposRecibo.value.find(
      t => t.nombre.toLowerCase() === tipoNombre.toLowerCase()
    );
    
    if (tipoEncontrado) {
      formData.value.tipo = tipoEncontrado.codigo;
    }
  }
};

const guardar = async () => {
  // Validar campos requeridos
  if (!formData.value.fecha || !formData.value.tipo || !formData.value.valorAbono || !formData.value.formaPago) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete todos los campos requeridos',
      position: 'top'
    });
    return;
  }

  try {
    loading.value = true;

    const recibo = {
      fecha: formData.value.fecha,
      observacion: formData.value.observaciones,
      tipo: formData.value.tipo,
      instalacion_codigo: parseInt(formData.value.instalacion),
      factura: formData.value.factura,
      valor: parseFloat(formData.value.valorAbono),
      documento: formData.value.documento,
      forma_pago: formData.value.formaPago
    };

    const response = await recibosCajaService.createRecibo(recibo);

    $q.notify({
      type: 'positive',
      message: response.message || 'Recibo guardado correctamente',
      position: 'top'
    });

    // Volver al listado de facturas después de guardar
    router.push('/facturas');
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el recibo: ' + error.message,
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const volver = () => {
  router.back();
};

onMounted(() => {
  // Cargar catálogos
  // Cargar catálogos
  loadCatalogos().then(() => {
    // Intentar establecer el tipo si viene en la query
    setTipoFromQuery();
  });

  // Recibir parámetros de la factura
  if (route.query.instalacion) {
    formData.value.instalacion = route.query.instalacion as string;
  }
  if (route.query.nombre) {
    formData.value.nombre = route.query.nombre as string;
  }
  if (route.query.factura) {
    formData.value.factura = route.query.factura as string;
  }
  if (route.query.valor) {
    formData.value.valor = route.query.valor as string;
    formData.value.valorAbono = route.query.valor as string;
  }
});
</script>

<style scoped>
.field-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.field-label::after {
  content: '';
}

.field-label:has(+ .q-field--filled):not(:has(+ .q-field--readonly))::before {
  content: '* ';
  color: #ef4444;
}
</style>

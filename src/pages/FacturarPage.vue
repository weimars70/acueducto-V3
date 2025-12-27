<template>
  <q-page padding>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <q-icon name="receipt_long" size="32px" color="primary" />
          <div>
            <h1 class="page-title">Generar Facturas</h1>
            <p class="page-subtitle">Convertir prefacturas a facturas definitivas</p>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <div class="form-card">
        <div class="form-section">
          <div class="section-header">
            <q-icon name="event" size="20px" color="primary" />
            <span class="section-title">Periodo de Facturación</span>
          </div>

          <div class="form-grid">
            <q-select
              v-model="formData.mes"
              :options="mesesOptions"
              label="Mes *"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => val !== null || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_month" />
              </template>
            </q-select>

            <q-select
              v-model="formData.year"
              :options="yearsOptions"
              label="Año *"
              outlined
              dense
              :rules="[val => val !== null || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <q-icon name="date_range" size="20px" color="primary" />
            <span class="section-title">Fechas de Pago</span>
          </div>

          <div class="form-grid">
            <q-input
              v-model="formData.sin_recargo"
              type="date"
              label="Fecha Sin Recargo *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="event_available" />
              </template>
            </q-input>

            <q-input
              v-model="formData.con_recargo"
              type="date"
              label="Fecha Con Recargo *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="event_busy" />
              </template>
            </q-input>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <q-icon name="water_drop" size="20px" color="primary" />
            <span class="section-title">Periodo de Consumo</span>
          </div>

          <div class="form-grid">
            <q-input
              v-model="formData.consumo_desde"
              type="date"
              label="Consumo Desde *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="play_arrow" />
              </template>
            </q-input>

            <q-input
              v-model="formData.consumo_hasta"
              type="date"
              label="Consumo Hasta *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="stop" />
              </template>
            </q-input>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <q-icon name="receipt" size="20px" color="primary" />
            <span class="section-title">Fecha de Factura</span>
          </div>

          <div class="form-grid">
            <q-input
              v-model="formData.fecha_factura"
              type="date"
              label="Fecha de Factura *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="today" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <q-btn
            label="Cancelar"
            color="grey-7"
            outline
            icon="close"
            @click="$router.back()"
            class="cancel-btn"
          />
          <q-btn
            label="Facturar"
            color="primary"
            unelevated
            icon="check_circle"
            @click="facturar"
            :loading="loading"
            class="save-btn"
          >
            <template v-slot:loading>
              <q-spinner-dots />
            </template>
          </q-btn>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { facturacionService } from '../services/api/facturacion.service';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);

const formData = ref({
  mes: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  sin_recargo: '',
  con_recargo: '',
  consumo_desde: '',
  consumo_hasta: '',
  fecha_factura: ''
});

const mesesOptions = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 }
];

const currentYear = new Date().getFullYear();
const yearsOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

const facturar = async () => {
  try {
    // Validar campos requeridos
    if (!formData.value.mes || !formData.value.year) {
      $q.notify({
        type: 'warning',
        message: 'Debe seleccionar mes y año',
        position: 'center'
      });
      return;
    }

    if (!formData.value.sin_recargo || !formData.value.con_recargo ||
        !formData.value.consumo_desde || !formData.value.consumo_hasta ||
        !formData.value.fecha_factura) {
      $q.notify({
        type: 'warning',
        message: 'Todos los campos son requeridos',
        position: 'center'
      });
      return;
    }

    if (!authStore.user?.empresaId) {
      $q.notify({
        type: 'negative',
        message: 'No se pudo obtener la empresa del usuario',
        position: 'center'
      });
      return;
    }

    loading.value = true;

    // Validar que existan prefacturas
    const validacion = await facturacionService.validarPrefacturas({
      empresaId: authStore.user.empresaId,
      mes: formData.value.mes,
      year: formData.value.year
    });

    if (!validacion.existenPrefacturas) {
      $q.notify({
        type: 'negative',
        message: 'No existen prefacturas para el mes y año seleccionados. Primero debe generar la prefactura.',
        position: 'center',
        timeout: 5000
      });
      loading.value = false;
      return;
    }

    // Mostrar confirmación con la cantidad de registros
    $q.dialog({
      title: 'Confirmar Facturación',
      message: `Se facturarán ${validacion.cantidad} registro(s) del mes ${mesesOptions[formData.value.mes - 1].label} ${formData.value.year}. ¿Desea continuar?`,
      cancel: {
        label: 'Cancelar',
        color: 'negative',
        flat: true
      },
      ok: {
        label: 'Facturar',
        color: 'primary'
      },
      persistent: true
    }).onOk(async () => {
      try {
        loading.value = true;

        const response = await facturacionService.generarFacturas({
          empresaId: authStore.user!.empresaId,
          mes: formData.value.mes,
          year: formData.value.year,
          sin_recargo: formData.value.sin_recargo,
          con_recargo: formData.value.con_recargo,
          consumo_desde: formData.value.consumo_desde,
          consumo_hasta: formData.value.consumo_hasta,
          fecha_factura: formData.value.fecha_factura
        });

        $q.notify({
          type: 'positive',
          message: response.message || `Facturas generadas exitosamente (${response.cantidad} registros)`,
          position: 'center',
          timeout: 5000
        });

        // Redirigir al listado de facturas
        router.push('/facturas');

      } catch (error: any) {
        console.error('Error al generar facturas:', error);
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'Error al generar facturas',
          position: 'center',
          timeout: 5000
        });
      } finally {
        loading.value = false;
      }
    }).onCancel(() => {
      loading.value = false;
    });

  } catch (error: any) {
    console.error('Error en validación:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al validar prefacturas',
      position: 'center'
    });
    loading.value = false;
  }
};
</script>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.page-subtitle {
  font-size: 14px;
  margin: 4px 0 0 0;
  opacity: 0.9;
  color: white;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-of-type {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
}

.cancel-btn,
.save-btn {
  min-width: 140px;
  height: 48px;
  font-weight: 600;
  text-transform: none;
  font-size: 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #fff4e6 !important;
  border-color: #fb923c !important;
  color: #ea580c !important;
}

.save-btn {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.save-btn:hover {
  background: #28A745 !important;
  border-color: #28A745 !important;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4) !important;
  transform: translateY(-2px);
}

:deep(.q-field__label) {
  font-weight: 500;
  color: #4b5563;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.q-field--outlined .q-field__control:hover) {
  border-color: #667eea;
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-card {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

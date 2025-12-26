<template>
  <q-page style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
    <div class="q-pa-md" style="max-width: 800px; margin: 0 auto;">
      <!-- Header -->
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0; font-weight: 700; color: #1f2937;">Enviar Facturas a DIAN</h4>
        <p style="margin: 8px 0 0 0; color: #6b7280;">Envío masivo de facturas al sistema DIAN</p>
      </div>

      <!-- Formulario -->
      <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
        <div class="row q-col-gutter-md">
          <!-- Año -->
          <div class="col-12 col-md-6">
            <div style="margin-bottom: 8px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px;">
                Año <span style="color: #dc2626;">*</span>
              </label>
            </div>
            <q-select
              v-model="formData.year"
              :options="yearsOptions"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'El año es requerido']"
              style="height: 48px; border-radius: 12px;"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Mes -->
          <div class="col-12 col-md-6">
            <div style="margin-bottom: 8px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px;">
                Mes <span style="color: #dc2626;">*</span>
              </label>
            </div>
            <q-select
              v-model="formData.mes"
              :options="mesesOptions"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'El mes es requerido']"
              style="height: 48px; border-radius: 12px;"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Número Inicial -->
          <div class="col-12 col-md-6">
            <div style="margin-bottom: 8px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px;">
                Instalación Inicial <span style="color: #9ca3af;">(Opcional)</span>
              </label>
            </div>
            <q-input
              v-model.number="formData.nroInicial"
              type="number"
              outlined
              dense
              placeholder="Dejar vacío para todas"
              :rules="[
                val => !val || val > 0 || 'Debe ser mayor a 0'
              ]"
              style="height: 48px; border-radius: 12px;"
            >
              <template v-slot:prepend>
                <q-icon name="tag" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Número Final -->
          <div class="col-12 col-md-6">
            <div style="margin-bottom: 8px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px;">
                Instalación Final <span style="color: #9ca3af;">(Opcional)</span>
              </label>
            </div>
            <q-input
              v-model.number="formData.nroFinal"
              type="number"
              outlined
              dense
              placeholder="Dejar vacío para todas"
              :rules="[
                val => !formData.nroInicial || !val || val >= formData.nroInicial || 'Debe ser mayor o igual al número inicial'
              ]"
              style="height: 48px; border-radius: 12px;"
            >
              <template v-slot:prepend>
                <q-icon name="tag" color="primary" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Información del rango -->
        <div v-if="formData.nroInicial && formData.nroFinal && formData.nroFinal >= formData.nroInicial"
             style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 24px; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; color: #1e40af;">
            <q-icon name="info" size="20px" />
            <span style="font-weight: 600;">
              Total de instalaciones a procesar: {{ formData.nroFinal - formData.nroInicial + 1 }}
            </span>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div v-if="procesando" style="margin-top: 24px;">
          <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #374151;">Procesando facturas...</span>
            <span style="color: #6b7280;">{{ progreso.actual }} / {{ progreso.total }}</span>
          </div>
          <q-linear-progress
            :value="progreso.porcentaje / 100"
            color="primary"
            size="12px"
            rounded
          />
          <div style="margin-top: 8px; text-align: center; color: #6b7280; font-size: 14px;">
            {{ progreso.porcentaje.toFixed(1) }}%
          </div>
        </div>

        <!-- Resultados -->
        <div v-if="resultados.length > 0" style="margin-top: 24px;">
          <div style="margin-bottom: 12px; font-weight: 600; color: #374151;">
            Resultados del envío:
          </div>
          <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
            <div v-for="(resultado, index) in resultados" :key="index"
                 style="padding: 8px; margin-bottom: 8px; border-radius: 6px;"
                 :style="{ background: resultado.success ? '#f0fdf4' : '#fef2f2' }">
              <div style="display: flex; align-items: center; gap: 8px;">
                <q-icon :name="resultado.success ? 'check_circle' : 'error'"
                        :color="resultado.success ? 'green' : 'red'"
                        size="20px" />
                <span style="font-weight: 500;">
                  Factura {{ resultado.prefijo }}-{{ resultado.factura }}
                </span>
              </div>
              <div v-if="!resultado.success" style="margin-top: 4px; font-size: 12px; color: #dc2626; margin-left: 28px;">
                {{ resultado.error }}
              </div>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div style="display: flex; gap: 12px; margin-top: 32px; justify-content: flex-end;">
          <q-btn
            label="Cancelar"
            color="grey-7"
            outline
            icon="close"
            class="cancel-btn"
            @click="$router.back()"
            :disable="procesando"
          />
          <q-btn
            label="Enviar a DIAN"
            color="primary"
            unelevated
            icon="cloud_upload"
            class="save-btn"
            @click="enviarDian"
            :loading="procesando"
            :disable="!isFormValid || procesando"
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
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { dianService } from '../services/api/dian.service';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  year: new Date().getFullYear(),
  mes: new Date().getMonth() + 1,
  nroInicial: null as number | null,
  nroFinal: null as number | null
});

const procesando = ref(false);
const progreso = ref({
  actual: 0,
  total: 0,
  porcentaje: 0
});

const resultados = ref<any[]>([]);

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
const yearsOptions = Array.from({ length: 5 }, (_, i) => ({
  label: String(currentYear - i),
  value: currentYear - i
}));

const isFormValid = computed(() => {
  // Año y mes son obligatorios
  if (!formData.value.year || !formData.value.mes) {
    return false;
  }

  // Si se especifica uno de los números, ambos deben estar y ser válidos
  if (formData.value.nroInicial || formData.value.nroFinal) {
    return formData.value.nroInicial &&
           formData.value.nroFinal &&
           formData.value.nroFinal >= formData.value.nroInicial;
  }

  // Si no se especifica ningún número, es válido
  return true;
});

const enviarDian = async () => {
  if (!isFormValid.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete todos los campos correctamente',
      position: 'top'
    });
    return;
  }

  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesNombre = mesesNombres[formData.value.mes! - 1];

  const rangoInfo = formData.value.nroInicial && formData.value.nroFinal
    ? `<div style="margin: 8px 0; padding: 12px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
         <div style="display: flex; align-items: center; gap: 8px; color: #1e40af;">
           <i class="material-icons" style="font-size: 20px;">home</i>
           <span style="font-weight: 600;">Instalaciones: ${formData.value.nroInicial} - ${formData.value.nroFinal}</span>
         </div>
       </div>`
    : `<div style="margin: 8px 0; padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
         <div style="display: flex; align-items: center; gap: 8px; color: #92400e;">
           <i class="material-icons" style="font-size: 20px;">warning</i>
           <span style="font-weight: 600;">Se enviarán TODAS las facturas del período</span>
         </div>
       </div>`;

  $q.dialog({
    title: `<div style="display: flex; align-items: center; gap: 12px; color: #1e40af;">
              <i class="material-icons" style="font-size: 28px;">cloud_upload</i>
              <span style="font-weight: 700; font-size: 20px;">Confirmar Envío a DIAN</span>
            </div>`,
    message: `
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 24px; border-radius: 12px; margin-top: 16px;">
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <i class="material-icons" style="color: #3b82f6; font-size: 20px;">calendar_today</i>
            <span style="color: #1e293b; font-weight: 600; font-size: 16px;">Período a Procesar</span>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 8px; color: #3b82f6; font-size: 18px; font-weight: 700;">
              <i class="material-icons">event</i>
              <span>${mesNombre} ${formData.value.year}</span>
            </div>
          </div>
        </div>

        ${rangoInfo}

        <div style="margin-top: 16px; padding: 16px; background: #fef3f2; border-radius: 8px; border-left: 4px solid #dc2626;">
          <div style="display: flex; align-items: center; gap: 8px; color: #991b1b;">
            <i class="material-icons" style="font-size: 20px;">info</i>
            <span style="font-weight: 600; font-size: 14px;">Esta acción enviará las facturas a la plataforma DIAN. ¿Desea continuar?</span>
          </div>
        </div>
      </div>
    `,
    html: true,
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      outline: true,
      noCaps: true,
      padding: '8px 24px'
    },
    ok: {
      label: 'Sí, Enviar a DIAN',
      color: 'primary',
      unelevated: true,
      noCaps: true,
      padding: '8px 24px',
      icon: 'send'
    },
    persistent: true,
    class: 'dian-confirm-dialog'
  }).onOk(async () => {
    procesando.value = true;
    resultados.value = [];
    progreso.value = { actual: 0, total: 0, porcentaje: 0 };

    if (!authStore.user?.empresaId) {
      $q.notify({
        type: 'negative',
        message: 'No se pudo obtener la empresa del usuario',
        position: 'top'
      });
      procesando.value = false;
      return;
    }

    const payload: any = {
      empresaId: authStore.user.empresaId,
      year: formData.value.year!,
      mes: formData.value.mes!
    };

    // Solo agregar nroInicial y nroFinal si están definidos
    if (formData.value.nroInicial && formData.value.nroFinal) {
      payload.nroInicial = formData.value.nroInicial;
      payload.nroFinal = formData.value.nroFinal;
    }

    // Iniciar polling del progreso
    let lastProgress = { actual: 0, total: 0, porcentaje: 0 };
    const progressInterval = setInterval(async () => {
      try {
        const progressData = await dianService.getProgress(
          authStore.user!.empresaId,
          formData.value.year!,
          formData.value.mes!
        );

        // Actualizar solo si hay progreso activo O si hay cambios
        if (progressData.enProceso || progressData.porcentaje > lastProgress.porcentaje) {
          progreso.value = {
            actual: progressData.actual,
            total: progressData.total,
            porcentaje: progressData.porcentaje
          };
          lastProgress = progressData;
        }
      } catch (error) {
        // Silenciar errores de polling para no interrumpir el proceso
        console.log('Esperando progreso...');
      }
    }, 1000); // Consultar cada 1 segundo (reducido para evitar sobrecarga)

    try {
      const response = await dianService.enviarFacturasDian(payload);

      progreso.value = {
        actual: response.procesadas,
        total: response.total,
        porcentaje: 100
      };

      resultados.value = response.resultados;

      // Mostrar diálogo de éxito
      $q.dialog({
        title: `<div style="display: flex; align-items: center; gap: 12px; color: #059669;">
                  <i class="material-icons" style="font-size: 32px;">check_circle</i>
                  <span style="font-weight: 700; font-size: 20px;">Envío Completado Exitosamente</span>
                </div>`,
        message: `
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 24px; border-radius: 12px; margin-top: 16px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <i class="material-icons" style="font-size: 64px; color: #059669;">cloud_done</i>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                <div>
                  <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Total Procesadas</div>
                  <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${response.procesadas}</div>
                </div>
                <div>
                  <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Exitosas</div>
                  <div style="font-size: 28px; font-weight: 700; color: #059669;">${response.exitosas}</div>
                </div>
                <div>
                  <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Fallidas</div>
                  <div style="font-size: 28px; font-weight: 700; color: #dc2626;">${response.fallidas}</div>
                </div>
              </div>
            </div>

            ${response.fallidas > 0
              ? `<div style="margin-top: 16px; padding: 12px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                   <div style="display: flex; align-items: center; gap: 8px; color: #991b1b;">
                     <i class="material-icons" style="font-size: 20px;">info</i>
                     <span style="font-size: 14px; font-weight: 600;">Revise los detalles de las facturas fallidas en la tabla inferior</span>
                   </div>
                 </div>`
              : `<div style="margin-top: 16px; padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
                   <div style="display: flex; align-items: center; gap: 8px; color: #065f46;">
                     <i class="material-icons" style="font-size: 20px;">verified</i>
                     <span style="font-size: 14px; font-weight: 600;">Todas las facturas fueron enviadas exitosamente a la DIAN</span>
                   </div>
                 </div>`
            }
          </div>
        `,
        html: true,
        ok: {
          label: 'Aceptar',
          color: 'positive',
          unelevated: true,
          noCaps: true,
          padding: '10px 32px',
          icon: 'done'
        },
        persistent: false
      });

    } catch (error: any) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || error.message || 'Error al enviar facturas a DIAN',
        position: 'top'
      });
    } finally {
      // Detener polling siempre
      clearInterval(progressInterval);
      procesando.value = false;
    }
  });
};
</script>

<style scoped lang="scss">
.q-field--outlined :deep(.q-field__control) {
  border-radius: 12px;
}

// Button hover effects
.cancel-btn {
  &:hover {
    background: #fff4e6 !important;
    border-color: #fb923c !important;
    color: #ea580c !important;
  }
}

.save-btn {
  &:hover {
    background: #28A745 !important;
    border-color: #28A745 !important;
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4) !important;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { migracionContabilidadService } from '../services/api/migracion-contabilidad.service';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const optionsMeses = ref<any[]>([]);
const form = ref({
  mes: new Date().getMonth() + 1, // Mes actual (1-12)
  year: new Date().getFullYear(),
  tipo: 'facturas' // 'facturas', 'cartera', 'detalles' o 'all'
});

// Progress state
const progress = ref(0);
const progressLabel = ref('');
const currentAction = ref('');
const totalToMigrate = ref(0);
const processedCount = ref(0);
const exitosasCount = ref(0);
const fallidasCount = ref(0);
const detallesErrores = ref<any[]>([]);

// Generar opciones de años
const currentYear = new Date().getFullYear();
const optionsYears = [currentYear, currentYear - 1, currentYear + 1];

const loadMeses = async () => {
    try {
        const data = await migracionContabilidadService.getMeses();
        optionsMeses.value = data.map((m: any) => ({
             label: m.nombre,
             value: m.id
        }));

        if (optionsMeses.value.length === 0) {
             const mesesNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
             optionsMeses.value = mesesNames.map((nombre, index) => ({ label: nombre, value: index + 1 }));
        }

    } catch (error) {
        console.error('Error cargando meses', error);
         const mesesNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
         optionsMeses.value = mesesNames.map((nombre, index) => ({ label: nombre, value: index + 1 }));
    }
};

const handleMigrar = async () => {
  if (!form.value.mes || !form.value.year) {
      $q.notify({ type: 'warning', message: 'Debe seleccionar Mes y Año' });
      return;
  }

  try {
    loading.value = true;
    resetProgress();
    
    const mes = typeof form.value.mes === 'object' ? (form.value.mes as any).value : form.value.mes;
    const year = form.value.year;

    if (form.value.tipo === 'all') {
        // Migración secuencial de todo
        await procesarMigracionTipo('facturas', mes, year);
        await procesarMigracionTipo('cartera', mes, year);
        await procesarMigracionTipo('detalles', mes, year);
    } else {
        // Migración individual
        await procesarMigracionTipo(form.value.tipo, mes, year);
    }

    currentAction.value = 'Proceso completado';
    
    if (exitosasCount.value > 0) {
        $q.notify({ 
            type: 'positive', 
            message: `${exitosasCount.value} registros migrados correctamente en total`,
            icon: 'check_circle'
        });
    }

  } catch (error: any) {
    console.error(error);
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.message || 'Error durante el proceso de migración',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
};

const procesarMigracionTipo = async (tipo: string, mes: number, year: number) => {
    const tipoLabel = tipo === 'facturas' ? 'Facturas' : (tipo === 'cartera' ? 'Cartera' : 'Detalles de Factura');
    currentAction.value = `Consultando ${tipoLabel}...`;
    
    let registros = [];
    try {
        if (tipo === 'facturas') {
            registros = await migracionContabilidadService.getFacturasPeriodo(mes, year);
        } else if (tipo === 'cartera') {
            registros = await migracionContabilidadService.getFacturasCarteraPeriodo(mes, year);
        } else {
            registros = await migracionContabilidadService.getFacturasDetallePeriodo(mes, year);
        }
    } catch (e) {
        console.error(`Error consultando ${tipo}:`, e);
        $q.notify({ type: 'negative', message: `Error al obtener ${tipoLabel}` });
        return;
    }

    if (!registros || registros.length === 0) {
        $q.notify({ type: 'info', message: `No se encontraron ${tipoLabel} para migrar` });
        return;
    }

    totalToMigrate.value = registros.length;
    processedCount.value = 0;
    const errorsToRetry = [];

    // 1. Proceso principal
    for (const item of registros) {
        processedCount.value++;
        progress.value = processedCount.value / totalToMigrate.value;
        currentAction.value = `Procesando ${tipoLabel}: registro ${processedCount.value} de ${totalToMigrate.value}`;
        progressLabel.value = `${Math.round(progress.value * 100)}% (${processedCount.value}/${totalToMigrate.value})`;
        
        try {
            await ejecutarMigracionIndividualPorTipo(tipo, item);
            exitosasCount.value++;
        } catch (error: any) {
            errorsToRetry.push({ item, tipo });
        }
    }

    // 2. Reintento automático
    if (errorsToRetry.length > 0) {
        const totalRetry = errorsToRetry.length;
        let processedRetry = 0;
        
        for (const errorObj of errorsToRetry) {
            processedRetry++;
            currentAction.value = `Reintentando ${tipoLabel} fallidos: ${processedRetry} de ${totalRetry}`;
            try {
                await ejecutarMigracionIndividualPorTipo(errorObj.tipo, errorObj.item);
                exitosasCount.value++;
            } catch (retryError: any) {
                fallidasCount.value++;
                const errorMsg = retryError.response?.data?.message || retryError.message;
                let refLabel = `${errorObj.item.prefijo}${errorObj.item.consecutivo}`;
                if (errorObj.tipo === 'detalles') {
                    refLabel += ` - L${errorObj.item.linea}`;
                }
                detallesErrores.value.push({
                    factura: `[${tipoLabel}] ${refLabel}`,
                    error: errorMsg,
                    data: errorObj.item,
                    tipo: errorObj.tipo
                });
            }
        }
    }
};

const ejecutarMigracionIndividualPorTipo = async (tipo: string, item: any) => {
    if (tipo === 'facturas') {
        return await migracionContabilidadService.migrarIndividual(item);
    } else if (tipo === 'cartera') {
        return await migracionContabilidadService.migrarCarteraIndividual(item);
    } else {
        return await migracionContabilidadService.migrarDetalleIndividual(item);
    }
};

const handleRetryAllFailures = async () => {
    if (detallesErrores.value.length === 0) return;
    
    try {
        loading.value = true;
        const toRetry = [...detallesErrores.value];
        detallesErrores.value = [];
        fallidasCount.value = 0;
        
        totalToMigrate.value = toRetry.length;
        processedCount.value = 0;
        
        for (const errorObj of toRetry) {
            processedCount.value++;
            progress.value = processedCount.value / totalToMigrate.value;
            currentAction.value = `Reintento manual: ${processedCount.value} de ${totalToMigrate.value}`;
            
            try {
                await ejecutarMigracionIndividualPorTipo(errorObj.tipo, errorObj.data);
                exitosasCount.value++;
            } catch (error: any) {
                fallidasCount.value++;
                detallesErrores.value.push(errorObj);
            }
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
        currentAction.value = 'Reintento finalizado';
    }
};

const resetProgress = () => {
    progress.value = 0;
    progressLabel.value = '0%';
    currentAction.value = '';
    totalToMigrate.value = 0;
    processedCount.value = 0;
    exitosasCount.value = 0;
    fallidasCount.value = 0;
    detallesErrores.value = [];
};

onMounted(() => {
    loadMeses();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-2">
    <div class="row q-col-gutter-lg justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        
        <!-- Header Card -->
        <q-card class="shadow-10 rounded-borders overflow-hidden q-mb-lg">
          <q-card-section class="bg-gradient-primary text-white q-pa-xl">
            <div class="row items-center no-wrap">
              <div class="icon-container q-mr-lg">
                <q-icon name="sync_alt" size="lg" />
              </div>
              <div>
                <div class="text-h4 text-weight-bolder">Migración Contable</div>
                <div class="text-subtitle1 q-mt-xs opacity-80 text-weight-medium">
                  Transfiere la facturación o cartera del período a contabilidad con seguimiento en tiempo real
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-xl bg-white">
            <q-form @submit="handleMigrar" class="q-gutter-y-lg">
              <div class="row justify-center q-mb-md">
                <q-btn-toggle
                  v-model="form.tipo"
                  toggle-color="primary"
                  unelevated
                  rounded
                  :options="[
                    {label: 'Migrar Todo', value: 'all', icon: 'auto_mode'},
                    {label: 'Migrar Facturas', value: 'facturas', icon: 'description'},
                    {label: 'Migrar Cartera', value: 'cartera', icon: 'account_balance_wallet'},
                    {label: 'Migrar Detalles', value: 'detalles', icon: 'list_alt'}
                  ]"
                  :disable="loading"
                  class="modern-toggle"
                />
              </div>

              <div class="row q-col-gutter-xl">
                <div class="col-12 col-md-6">
                  <div class="field-label q-mb-sm">Año del Periodo</div>
                  <q-select
                    outlined
                    stack-label
                    v-model="form.year"
                    :options="optionsYears"
                    emit-value
                    map-options
                    class="modern-input"
                    :disable="loading"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_month" color="primary" />
                    </template>
                  </q-select>
                </div>

                <div class="col-12 col-md-6">
                  <div class="field-label q-mb-sm">Mes del Periodo</div>
                  <q-select
                    outlined
                    stack-label
                    v-model="form.mes"
                    :options="optionsMeses"
                    emit-value
                    map-options
                    class="modern-input"
                    :disable="loading"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event_repeat" color="primary" />
                    </template>
                  </q-select>
                </div>
              </div>

              <div class="row justify-center q-pt-md">
                <q-btn
                  :label="form.tipo === 'all' ? 'Empezar Migración Completa' : (form.tipo === 'facturas' ? 'Empezar Migración de Facturas' : (form.tipo === 'cartera' ? 'Empezar Migración de Cartera' : 'Empezar Migración de Detalles'))"
                  type="submit"
                  color="primary"
                  unelevated
                  padding="18px 45px"
                  class="migration-btn text-weight-bold shadow-4"
                  :loading="loading"
                  size="1.1rem"
                  :disable="loading"
                >
                  <q-icon :name="form.tipo === 'all' ? 'auto_mode' : (form.tipo === 'facturas' ? 'rocket_launch' : (form.tipo === 'cartera' ? 'account_balance' : 'list_alt'))" class="q-ml-sm" />
                  <template v-slot:loading>
                    <q-spinner-dots size="2.5rem" />
                  </template>
                </q-btn>
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Progress Card -->
        <transition appear enter-active-class="animated slideInUp">
          <q-card v-if="loading || totalToMigrate > 0" class="shadow-10 rounded-borders q-mb-lg border-primary">
            <q-card-section class="q-pa-lg">
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6 text-weight-bold color-primary flex items-center">
                  <q-icon :name="loading ? 'autorenew' : 'done_all'" :class="loading ? 'rotate' : ''" color="primary" size="sm" class="q-mr-sm" />
                  {{ currentAction }}
                </div>
                <div class="text-subtitle2 text-weight-bold text-grey-7">{{ progressLabel }}</div>
              </div>
              
              <q-linear-progress 
                :value="progress" 
                color="primary" 
                track-color="blue-1"
                class="progress-bar"
                stripe
                rounded
                size="25px"
              />

              <div class="row q-col-gutter-md q-mt-lg">
                <div class="col-4">
                  <div class="stat-box bg-blue-1 text-blue-9">
                    <div class="text-h6 text-weight-bolder">{{ totalToMigrate }}</div>
                    <div class="text-caption text-weight-bold">Total</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="stat-box bg-green-1 text-green-9">
                    <div class="text-h6 text-weight-bolder">{{ exitosasCount }}</div>
                    <div class="text-caption text-weight-bold">OK</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="stat-box bg-red-1 text-red-9">
                    <div class="text-h6 text-weight-bolder">{{ fallidasCount }}</div>
                    <div class="text-caption text-weight-bold">Errores</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </transition>

        <!-- Errors List -->
        <transition appear enter-active-class="animated slideInUp">
          <q-card v-if="detallesErrores.length > 0" class="shadow-10 rounded-borders q-mb-xl overflow-hidden">
            <q-card-section class="bg-red-7 text-white q-py-md">
              <div class="row items-center justify-between no-wrap">
                <div class="text-h6 text-weight-bold flex items-center">
                  <q-icon name="warning" class="q-mr-sm" />
                  Registros con Errores ({{ detallesErrores.length }})
                </div>
                <q-btn 
                  flat 
                  round 
                  icon="refresh" 
                  color="white" 
                  @click="handleRetryAllFailures"
                  :loading="loading"
                >
                  <q-tooltip>Reintentar todos los errores</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
            <q-list bordered separator class="max-height-errors">
              <q-item v-for="(error, index) in detallesErrores" :key="index" class="q-py-md">
                <q-item-section avatar>
                  <q-icon name="error" color="red-6" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Factura {{ error.factura }}</q-item-label>
                  <q-item-label caption class="text-red-8">{{ error.error }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </transition>

      </div>
    </div>
  </q-page>
</template>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.icon-container {
  background: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 16px;
  backdrop-filter: blur(5px);
}

.modern-toggle {
  border: 1px solid #e0e0e0;
  padding: 4px;
}

.modern-toggle :deep(.q-btn) {
  min-width: 180px;
  font-weight: bold;
}

.field-label {
  font-weight: 600;
  color: #455a64;
  font-size: 0.95rem;
}

.modern-input :deep(.q-field__control) {
  border-radius: 12px;
}

.migration-btn {
  border-radius: 14px;
  min-width: 320px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.migration-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 20px rgba(25, 118, 210, 0.3) !important;
}

.progress-bar {
  border-radius: 15px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.stat-box {
  text-align: center;
  padding: 15px 10px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
}

.color-primary {
  color: #1976d2;
}

.border-primary {
  border-left: 6px solid #1976d2;
}

.max-height-errors {
  max-height: 400px;
  overflow-y: auto;
}

.rotate {
  animation: rotation 2s infinite linear;
}

@keyframes rotation {
  from { transform: rotate(0deg); }
  to { transform: rotate(359deg); }
}

.rounded-borders {
  border-radius: 16px;
}

.opacity-80 {
  opacity: 0.8;
}
</style>

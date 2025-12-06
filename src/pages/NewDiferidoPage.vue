<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { diferidosService } from '../services/api/diferidos.service';
import { conceptoFacturaService } from '../services/api/concepto-factura.service';
import { instalacionesService, type Instalacion } from '../services/api/instalaciones.service';
import { useAuthStore } from '../stores/auth';
import type { CreateDiferidoDto } from '../types/diferido';
import type { ConceptoFactura } from '../types/concepto-factura';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const conceptos = ref<ConceptoFactura[]>([]);
const instalaciones = ref<Instalacion[]>([]);
const filteredInstalaciones = ref<Instalacion[]>([]);
const formData = ref<CreateDiferidoDto>({
  empresaId: authStore.user?.empresaId || 0,
  contratoId: 0,
  conceptoDiferidoId: 0,
  montoOriginal: 0,
  numeroCuotas: 1,
  porInteres: 0,
  valorCuota: 0,
  fechaInicio: new Date().toISOString().split('T')[0],
  observaciones: '',
  usuario: authStore.user?.email || ''
});



const valorCuotaEstimada = computed(() => {
    const monto = formData.value.montoOriginal || 0;
    const cuotas = formData.value.numeroCuotas || 1;
    const interes = formData.value.porInteres || 0; // percentage, e.g. 2 for 2%
    
    // Simple calculation: (Monto + (Monto * Interes / 100)) / Cuotas
    // Adjust formula if compound interest or different logic is needed
    // Assuming simple interest over total amount for now based on user request "por_interes"
    
    // If interest is 0:
    if (interes === 0) return monto / cuotas;

    // If interest is monthly applied? or total? usually simple flat rate for agreements
    const totalConInteres = monto + (monto * (interes / 100));
    return totalConInteres / cuotas;
});

const loadData = async () => {
    try {
        const [kConceptos, kInstalaciones] = await Promise.all([
            conceptoFacturaService.getAll(authStore.user?.empresaId),
            instalacionesService.getAll(authStore.user?.empresaId)
        ]);
        conceptos.value = kConceptos;
        instalaciones.value = kInstalaciones;
        filteredInstalaciones.value = kInstalaciones;
    } catch (e) {
        console.error(e);
        $q.notify({ type: 'negative', message: 'Error cargando datos' });
    }
}

const filterInstalaciones = (val: string, update: (fn: () => void) => void) => {
    if (val === '') {
        update(() => {
            filteredInstalaciones.value = instalaciones.value;
        });
        return;
    }

    update(() => {
        const needle = val.toLowerCase();
        filteredInstalaciones.value = instalaciones.value.filter(v => 
            v.nombre.toLowerCase().indexOf(needle) > -1 || 
            v.codigo.toString().indexOf(needle) > -1 ||
            v.direccion.toLowerCase().indexOf(needle) > -1
        );
    });
}

const handleSubmit = async () => {
    // Validation
    let hasError = false;
    if (formData.value.contratoId <= 0) hasError = true;
    if (formData.value.conceptoDiferidoId <= 0) hasError = true;
    if (formData.value.montoOriginal <= 0) hasError = true;
    if (formData.value.numeroCuotas <= 0) hasError = true;

    if (hasError) {
        // Form rules handle display, but we stop submit
        $q.notify({ type: 'warning', message: 'Por favor verifique los campos obligatorios.' });
        return;
    }

  try {
    loading.value = true;
    await diferidosService.create(formData.value);
    $q.notify({ type: 'positive', message: 'Diferido registrado correctamente' });
    router.push('/diferidos');
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'No se pudo crear el diferido' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
    loadData();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        
        <div class="row items-center q-mb-lg">
             <q-btn flat round icon="arrow_back" color="grey-8" @click="$router.go(-1)" class="q-mr-md" />
             <div>
                <div class="text-h5 text-weight-bold text-primary">Registrar Diferido</div>
                <div class="text-caption text-grey-7">Complete la información para crear un nuevo acuerdo de pago</div>
             </div>
        </div>

        <q-card class="shadow-4 rounded-xl bg-white overflow-hidden">
          <q-card-section class="q-pa-none">
             <div class="row">
                 <div class="col-12 col-md-4 bg-primary text-white q-pa-xl column justify-between relative-position">
                     <div>
                         <div class="text-h6 text-weight-bold q-mb-md opacity-80">Información General</div>
                         <p class="text-white opacity-60">
                             Asegúrese de seleccionar el contrato correcto y verificar el monto antes de guardar. 
                             El número de cuotas determinará el plazo del acuerdo.
                         </p>
                     </div>
                     <div class="absolute-bottom-right q-ma-lg opacity-20">
                         <q-icon name="assignment" size="100px" />
                     </div>
                 </div>
                 
                 <div class="col-12 col-md-8 q-pa-xl">
                    <q-form @submit="handleSubmit" class="q-gutter-md">
                    
                        <div class="text-subtitle2 text-grey-8 q-mb-sm text-uppercase text-weight-bold letter-spacing-1">Datos Principales</div>
                        <div class="row q-col-gutter-lg">
                            <div class="col-12 col-md-6">
                                <label class="text-weight-medium text-grey-9 q-mb-xs block">Contrato</label>
                                <q-select
                                    outlined
                                    dense
                                    v-model="formData.contratoId"
                                    :options="filteredInstalaciones"
                                    option-value="codigo"
                                    :option-label="opt => `${opt.codigo} - ${opt.nombre}`"
                                    emit-value
                                    map-options
                                    use-input
                                    input-debounce="0"
                                    @filter="filterInstalaciones"
                                    placeholder="Buscar instalación..."
                                    class="modern-input bg-grey-1"
                                    hide-bottom-space
                                    :rules="[val => val > 0 || 'Requerido']"
                                >
                                    <template v-slot:prepend>
                                        <q-icon name="home" color="grey-6" size="xs" />
                                    </template>
                                    <template v-slot:option="scope">
                                        <q-item v-bind="scope.itemProps">
                                            <q-item-section>
                                                <q-item-label>{{ scope.opt.codigo }} - {{ scope.opt.nombre }}</q-item-label>
                                                <q-item-label caption>{{ scope.opt.direccion }}</q-item-label>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="text-weight-medium text-grey-9 q-mb-xs block">Concepto</label>
                                <q-select
                                    outlined
                                    dense
                                    v-model="formData.conceptoDiferidoId"
                                    :options="conceptos"
                                    option-value="codigo"
                                    option-label="nombre"
                                    emit-value
                                    map-options
                                    placeholder="Seleccione..."
                                    class="modern-input bg-grey-1"
                                    hide-bottom-space
                                    :rules="[val => val > 0 || 'Requerido']"
                                >
                                    <template v-slot:prepend>
                                        <q-icon name="category" color="grey-6" size="xs" />
                                    </template>
                                </q-select>
                            </div>
                        </div>

                        <q-separator class="q-my-md bg-grey-2" />

                        <div class="text-subtitle2 text-grey-8 q-mb-sm text-uppercase text-weight-bold letter-spacing-1">Valores y Plazos</div>
                        <div class="row q-col-gutter-lg">
                            <div class="col-12 col-md-4">
                                <label class="text-weight-medium text-grey-9 q-mb-xs block">Monto Original</label>
                                <q-input
                                    outlined
                                    dense
                                    type="number"
                                    v-model.number="formData.montoOriginal"
                                    prefix="$"
                                    class="modern-input bg-grey-1"
                                    hide-bottom-space
                                    :rules="[val => val > 0 || 'Requerido']"
                                />
                            </div>
                            <div class="col-12 col-md-4">
                                <label class="text-weight-medium text-grey-9 q-mb-xs block">Nro. de Cuotas</label>
                                <q-input
                                    outlined
                                    dense
                                    type="number"
                                    v-model.number="formData.numeroCuotas"
                                    class="modern-input bg-grey-1"
                                    hide-bottom-space
                                    :rules="[val => val > 0 || 'Requerido']"
                                >
                                    <template v-slot:append>
                                        <div class="text-caption text-grey-5">meses</div>
                                    </template>
                                </q-input>
                            </div>
                             <div class="col-12 col-md-4">
                                <label class="text-weight-medium text-grey-9 q-mb-xs block">Inicio</label>
                                <q-input outlined dense v-model="formData.fechaInicio" type="date" class="modern-input bg-grey-1" hide-bottom-space />
                            </div>
                        </div>

                        <!-- Nueva fila para Interés y Valor Cuota -->
                        <div class="row q-col-gutter-lg q-mt-sm">
                             <div class="col-12 col-md-6">
                                <label class="text-weight-medium text-grey-9 q-mb-xs block">% Interés (Opcional)</label>
                                <q-input
                                    outlined
                                    dense
                                    type="number"
                                    v-model.number="formData.porInteres"
                                    suffix="%"
                                    placeholder="0"
                                    class="modern-input bg-grey-1"
                                    hide-bottom-space
                                />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="text-weight-medium text-grey-9 q-mb-xs block">Valor Cuota Estimada</label>
                                <q-input
                                    outlined
                                    dense
                                    readonly
                                    :model-value="valorCuotaEstimada ? valorCuotaEstimada.toFixed(2) : '0.00'"
                                    prefix="$"
                                    class="modern-input bg-grey-2"
                                    hide-bottom-space
                                    hint="Calculado automáticamente"
                                />
                            </div>
                        </div>

                        <div class="row q-mt-md">
                            <div class="col-12">
                                <label class="text-weight-medium text-grey-9 q-mb-xs block">Observaciones</label>
                                <q-input
                                    outlined
                                    dense
                                    v-model="formData.observaciones"
                                    type="textarea"
                                    rows="2"
                                    placeholder="Agregue notas adicionales aquí..."
                                    class="modern-input bg-grey-1"
                                />
                            </div>
                        </div>

                        <div class="row justify-end q-mt-xl items-center q-gutter-md">
                            <q-btn flat label="Cancelar" color="grey-7" to="/diferidos" no-caps class="text-weight-bold" />
                            <q-btn label="Guardar Diferido" type="submit" color="primary" unelevated class="q-px-xl shadow-2" rounded :loading="loading" no-caps size="md" />
                        </div>
                    </q-form>
                 </div>
             </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.rounded-xl {
  border-radius: 20px;
}
.opacity-80 { opacity: 0.9; }
.opacity-60 { opacity: 0.7; }
.opacity-20 { opacity: 0.1; }
.letter-spacing-1 { letter-spacing: 1px; }

.modern-input :deep(.q-field__control) {
    border-radius: 10px;
    border-color: transparent;
}
.modern-input :deep(.q-field__control:hover) {
    border-color: #e0e0e0;
}
</style>

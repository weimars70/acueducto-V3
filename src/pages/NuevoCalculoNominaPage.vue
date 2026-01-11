<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { nominasService } from '../services/api/nomina.service';
import { periodoNominaService } from '../services/api/periodo-nomina.service';
import { empleadoService } from '../services/api/empleado.service';
import { conceptoNominaService } from '../services/api/concepto-nomina.service';
import { parametroNominaService } from '../services/api/parametro-nomina.service'; // Import service
import type { PeriodoNomina } from '../types/periodo-nomina';
import type { Empleado } from '../types/empleado';
import type { ConceptoNomina } from '../types/concepto-nomina';
import type { ParametroNomina } from '../types/parametro-nomina'; // Import type
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const router = useRouter();
const { exportNominaVouchers, generateNominaVouchers } = useExport();

// Data States
const periodos = ref<PeriodoNomina[]>([]);
const empleados = ref<Empleado[]>([]);
const conceptos = ref<ConceptoNomina[]>([]);
const parametros = ref<ParametroNomina[]>([]); // Store parameters
const nominasMap = ref<Map<number, any>>(new Map()); // Cache employee's calculated data

// Selection States
const selectedPeriodId = ref<number | null>(null);
const selectedEmployeeId = ref<number | null>(null);
const selectedDate = ref<string>(new Date().toISOString().split('T')[0]);

// Form States
const novedadForm = ref({
  conceptoId: null as number | null,
  cantidad: null as number | null,
  valor: null as number | null,
  observacion: '',
  fecha: new Date().toISOString().split('T')[0]
});

// UI States
const loading = ref(false);
const calculating = ref(false);
const filterEmpleado = ref('');
const showPreviewModal = ref(false);
const previewPdfUrl = ref('');

// Computed
const selectedPeriod = computed(() => periodos.value.find(p => p.id === selectedPeriodId.value));
const selectedEmployee = computed(() => empleados.value.find(e => e.id === selectedEmployeeId.value));
const selectedConcept = computed(() => conceptos.value.find(c => c.id === novedadForm.value.conceptoId));

const filteredEmpleados = computed(() => {
  if (!filterEmpleado.value) return empleados.value;
  const search = filterEmpleado.value.toLowerCase();
  return empleados.value.filter(e => 
    e.nombre_completo.toLowerCase().includes(search) || 
    e.cedula.includes(search)
  );
});

const currentNominaData = computed(() => {
  if (!selectedEmployeeId.value) return null;
  return nominasMap.value.get(selectedEmployeeId.value);
});

const missingParameters = computed(() => {
  const missing = [];
  const params = parametros.value;
  if (params.length === 0 && !loading.value) return []; // Don't show if empty initially or loading
  
  if (!params.find(p => p.codigo === 'AUX_TRANSPORTE' || p.codigo === 'AUX_TRANS')) missing.push('Auxilio Transporte (Parametro: AUX_TRANSPORTE)');
  if (!params.find(p => p.codigo === 'HORAS_LABORALES_MES')) missing.push('Horas Laborales Mes (Parametro: HORAS_LABORALES_MES)');

  // Checks for Concepts (Unified parameters)
  const concepts = conceptos.value;
  if (!concepts.find(c => c.codigo === 'HE_DIURNA' || c.nombre.toLowerCase().includes('diurna'))) missing.push('Concepto HE Diurna (HE_DIURNA) - Revise %');
  if (!concepts.find(c => c.codigo === 'HE_FESTIVA' || c.nombre.toLowerCase().includes('festiva'))) missing.push('Concepto HE Festiva (HE_FESTIVA) - Revise %');
  if (!concepts.find(c => c.codigo === 'SALUD' || c.nombre.toLowerCase().includes('salud'))) missing.push('Concepto Salud (SALUD) - Revise %');
  if (!concepts.find(c => c.codigo === 'PENSION' || c.nombre.toLowerCase().includes('pension'))) missing.push('Concepto Pensión (PENSION) - Revise %');
  
  return missing;
});

// Methods

const loadInitialData = async () => {
  try {
    loading.value = true;
    const [periodosData, empleadosData, conceptosData, parametrosData] = await Promise.all([
      periodoNominaService.getPeriodos({ page: 1, limit: 100 }),
      empleadoService.getEmpleados({ activo: true, limit: 100 } as any),
      conceptoNominaService.getConceptos({ activo: true, limit: 100 }),
      parametroNominaService.getParametros({ anio: new Date().getFullYear(), limit: 50 })
    ]);
    
    periodos.value = periodosData.data || [];
    empleados.value = empleadosData.data || [];
    conceptos.value = conceptosData.data || [];
    parametros.value = parametrosData.data || [];
  } catch (error) {
    console.error('Error loading data:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar datos iniciales' });
  } finally {
    loading.value = false;
  }
};

const loadNominaForPeriod = async () => {
  if (!selectedPeriodId.value) return;
  
  try {
    loading.value = true;
    const data = await nominasService.getEmpleadosConNominas(selectedPeriodId.value);
    
    // Create a map for quick access
    const map = new Map();
    data.forEach(item => {
      map.set(item.empleado.id, item);
    });
    nominasMap.value = map;
    
  } catch (error) {
    console.error('Error loading nomina data:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar datos de nómina' });
  } finally {
    loading.value = false;
  }
};

const handleAddNovedad = async () => {
  if (!selectedPeriodId.value || !selectedEmployeeId.value || !selectedConcept.value) {
    $q.notify({ type: 'warning', message: 'Complete los campos requeridos' });
    return;
  }

  calculating.value = true;
  try {
    const concepto = selectedConcept.value;
    const empleado = selectedEmployee.value;

    // Determine type based on concept or map logically
    // Since API is specific for HE vs Others, we try to route intelligently
    // This is a heuristic until strict backend generic implementation
    
    if (concepto.nombre.toLowerCase().includes('hora extra')) {
       // Logic for HE
       const tipoHE = concepto.nombre.toLowerCase().includes('festiva') || concepto.nombre.toLowerCase().includes('dominical') 
                      ? 'FESTIVA' : 'DIURNA';
       
       await nominasService.crearHoraExtra({
         empleadoId: selectedEmployeeId.value,
         periodoId: selectedPeriodId.value,
         tipo: tipoHE,
         cantidadHoras: Number(novedadForm.value.cantidad),
         fecha: novedadForm.value.fecha,
         aprobado: true
       });

    } else {
        // Default to Other Payment
       const tipoPago = concepto.tipo === 'DEDUCCION' ? 'DEDUCCION' : 'INGRESO';
       
       await nominasService.crearOtroPago({
         empleadoId: selectedEmployeeId.value,
         periodoId: selectedPeriodId.value,
         concepto: concepto.nombre, 
         valor: Number(novedadForm.value.valor || 0), // Some concepts might need value directly
         tipo: tipoPago,
         aprobado: true
       });
    }

    $q.notify({ type: 'positive', message: 'Novedad agregada' });
    
    // Refresh only current employee data if possible, or reload all
    // For now reload all to be safe and simple
    await loadNominaForPeriod();
    
    // Reset minimal form
    novedadForm.value.cantidad = null;
    novedadForm.value.valor = null;

  } catch (error: any) {
    console.error('Error adding novedad:', error);
     $q.notify({ type: 'negative', message: error?.response?.data?.message || 'Error al agregar novedad' });
  } finally {
    calculating.value = false;
  }
};

const calculateTotals = (nominaRow: any) => {
  if (!nominaRow) return { 
    devengado: 0, 
    deducciones: 0, 
    neto: 0,
    parametrosUsados: { 
        auxTransporte: 0, 
        saludPct: 0, 
        pensionPct: 0,
        factorHED: 0,
        factorHEF: 0,
        horasMes: 0
    } 
  };
  
  // 1. Get Global Parameters (Constants)
  const auxTransporteParam = parametros.value.find(p => p.codigo === 'AUX_TRANSPORTE' || p.codigo === 'AUX_TRANS');
  const horasMesParam = parametros.value.find(p => p.codigo === 'HORAS_LABORALES_MES');
  
  // 2. Get Concepts with embedded parameters (Factors/Percentages)
  const conceptoSalud = conceptos.value.find(c => c.codigo === 'SALUD' || c.nombre.toLowerCase().includes('salud'));
  const conceptoPension = conceptos.value.find(c => c.codigo === 'PENSION' || c.nombre.toLowerCase().includes('pension'));
  const conceptoHED = conceptos.value.find(c => c.codigo === 'HE_DIURNA' || c.nombre.toLowerCase().includes('diurna'));
  const conceptoHEF = conceptos.value.find(c => c.codigo === 'HE_FESTIVA' || c.nombre.toLowerCase().includes('festiva'));

  // 3. Extract Values
  const auxTransporteValor = auxTransporteParam ? Number(auxTransporteParam.valor) : 0;
  const horasMes = horasMesParam ? Number(horasMesParam.valor) : 240; // Default 240 if not found, standardized

  // 4. Extract Factors from Concepts (Unified Parameterization)
  // Use 'porcentaje' field. Support both 4.0 and 0.04 formats.
  const getPct = (c: any) => {
     if (!c || !c.porcentaje) return 0;
     return c.porcentaje > 1 ? c.porcentaje / 100 : c.porcentaje;
  };
  // For HE Factors, user might put 1.25 (which is < 2) or 125 (which is > 2).
  // Standard HE factor is around 1.25 to 2.5.
  const getFactor = (c: any) => {
      if (!c || !c.porcentaje) return 0;
      // If user enters 1.25, use it. If 125, divide.
      return c.porcentaje > 10 ? c.porcentaje / 100 : c.porcentaje;
  };

  const saludPct = getPct(conceptoSalud);
  const pensionPct = getPct(conceptoPension);
  const factorHED = getFactor(conceptoHED);
  const factorHEF = getFactor(conceptoHEF);

  const salarioMensual = nominaRow.empleado.salario_mensual;
  const dias = selectedPeriod.value?.dias_periodo || 15;
  const basico = (salarioMensual / 30) * dias;
  
  // Dynamic Calculation
  const valorHora = horasMes > 0 ? (salarioMensual / horasMes) : 0;
  
  const he = (nominaRow.horasExtrasDiurnas * valorHora * factorHED) + 
             (nominaRow.horasExtrasFestivas * valorHora * factorHEF); 
  
  // Calculate proportionate Aux Transporte
  const aux = nominaRow.empleado.auxilio_transporte ? (auxTransporteValor / 30) * dias : 0;
  
  const totalDev = basico + he + aux + nominaRow.otrosPagos;
  
  // Base for deductions (usually Basic + HE, sometimes AuxTrans is excluded from IBG)
  const ibc = basico + he; 
  const totalDed = (ibc * saludPct) + (ibc * pensionPct) + nominaRow.otrasDeducciones;
  
  return {
    devengado: totalDev,
    deducciones: totalDed,
    neto: totalDev - totalDed,
    parametrosUsados: {
        auxTransporte: auxTransporteValor,
        saludPct: saludPct * 100,
        pensionPct: pensionPct * 100,
        factorHED: factorHED,
        factorHEF: factorHEF,
        horasMes: horasMes
    }
  };
};

const handlePreviewVoucher = async () => {
  if (!currentNominaData.value) return;
  
  try {
     const row = currentNominaData.value;
     // Construct voucher object (similar to V1)
     // ... (Adaptation of existing logic for preview)
     // For brevity, we call the calculation service first to ensure backend consistency
     if (row.nomina) {
         await nominasService.calcularNomina(row.nomina.id);
     }
     
     // Reload to get fresh calc
     await loadNominaForPeriod();
     const updatedRow = nominasMap.value.get(selectedEmployeeId.value!);
     
     // Mocking the voucher structure expected by generateNominaVouchers
     // Ideally we should centralize this mapping
     const voucher = {
          id: updatedRow.nomina?.id,
          empleado: updatedRow.empleado,
          periodo: selectedPeriod.value,
          salarioMensual: updatedRow.empleado.salario_mensual,
          ...calculateTotals(updatedRow) // Fallback or use backend values if available in 'nomina' object
     };
     // Note: Real implementation should fully map backend response like in V1
     // Assuming generateNominaVouchers can handle partials or we map fully.
     // Let's rely on standard logic used in V1 as much as possible.
     
     $q.notify({ type: 'info', message: 'Funcionalidad de vista previa completa disponible en la versión estandar.' });
     
  } catch (e) {
      console.error(e);
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
};

// Watchers
watch(selectedPeriodId, () => {
  selectedEmployeeId.value = null;
  loadNominaForPeriod();
});

onMounted(() => {
  loadInitialData();
});

</script>

<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header With Period Selection -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h1 class="text-h5 text-weight-bold text-primary q-my-none">Nómina Detallada</h1>
        <div class="text-subtitle2 text-grey-7">Gestión vertical de novedades por empleado</div>
      </div>
      <div class="row q-gutter-md">
         <q-select
            v-model="selectedPeriodId"
            :options="periodos"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            outlined
            dense
            bg-color="white"
            class="period-select"
            label="Seleccionar Período"
          />
      </div>
    </div>

    <!-- Missing Parameters Warning -->
     <div v-if="missingParameters.length > 0" class="q-mb-md">
      <q-banner dense class="bg-orange text-white rounded-borders">
        <template v-slot:avatar>
          <q-icon name="warning" color="white" />
        </template>
        <div class="text-subtitle2">Configuración Faltante</div>
        <div>
          Faltan parámetros globales o porcentajes en conceptos necesarios para el cálculo:
        </div>
        <ul>
          <li v-for="p in missingParameters" :key="p">{{ p }}</li>
        </ul>
        <template v-slot:action>
          <q-btn flat color="white" label="Configurar Parámetros" @click="router.push('/parametros-nomina')" />
          <q-btn flat color="white" label="Configurar Conceptos" @click="router.push('/conceptos-nomina')" />
        </template>
      </q-banner>
    </div>

    <!-- Main Layout -->
    <div class="row q-col-gutter-md" v-if="selectedPeriodId">
      <!-- Left Column: Employee List -->
      <div class="col-12 col-md-3">
        <q-card flat class="full-height shadow-1">
          <q-card-section class="q-pb-xs">
            <q-input 
              v-model="filterEmpleado" 
              dense 
              outlined 
              placeholder="Buscar empleado..."
              class="q-mb-sm"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>
          
          <q-scroll-area style="height: calc(100vh - 250px);">
            <q-list separator>
              <q-item 
                v-for="emp in filteredEmpleados" 
                :key="emp.id"
                clickable
                v-ripple
                :active="selectedEmployeeId === emp.id"
                active-class="bg-blue-1 text-primary"
                @click="selectedEmployeeId = emp.id"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" size="sm">
                    {{ emp.nombre_completo.charAt(0) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ emp.nombre_completo }}</q-item-label>
                  <q-item-label caption>{{ emp.cargo || 'Empleado' }}</q-item-label>
                </q-item-section>
                 <q-item-section side v-if="nominasMap.has(emp.id)">
                    <q-icon name="check_circle" color="green" size="xs" />
                 </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card>
      </div>

      <!-- Center/Right: Detail & Summary -->
      <div class="col-12 col-md-9" v-if="selectedEmployeeId">
         <div class="row q-col-gutter-md">
            <!-- Center: inputs -->
            <div class="col-12 col-md-7">
               <q-card flat class="shadow-1 q-mb-md">
                  <q-card-section class="bg-primary text-white q-py-sm">
                     <div class="text-subtitle1 text-weight-bold">Agregar Novedad</div>
                     <div class="text-caption">{{ selectedEmployee?.nombre_completo }}</div>
                  </q-card-section>
                  <q-card-section class="q-gutter-md">
                     <div class="row q-col-gutter-sm">
                        <div class="col-12 col-sm-6">
                           <q-input 
                             v-model="novedadForm.fecha" 
                             type="date" 
                             label="Fecha de Novedad" 
                             outlined dense 
                           />
                        </div>
                        <div class="col-12 col-sm-6">
                           <q-select 
                             v-model="novedadForm.conceptoId" 
                             :options="conceptos"
                             option-value="id"
                             option-label="nombre"
                             emit-value
                             map-options
                             label="Concepto" 
                             outlined dense 
                           />
                        </div>
                     </div>
                     
                     <div class="row q-col-gutter-sm">
                        <div class="col-12 col-sm-6">
                          <q-input 
                            v-model.number="novedadForm.cantidad" 
                            type="number" 
                            label="Cantidad (Horas/Días)" 
                            outlined dense 
                            hint="Para horas extras, etc."
                          />
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-input 
                            v-model.number="novedadForm.valor" 
                            type="number" 
                            label="Valor Total ($)" 
                            outlined dense 
                            hint="Para bonos o deducciones fijas"
                          />
                        </div>
                     </div>
                     
                     <div class="row justify-end">
                        <q-btn 
                          label="Agregar Novedad" 
                          color="primary" 
                          icon="add" 
                          unelevated
                          :loading="calculating"
                          @click="handleAddNovedad"
                        />
                     </div>
                  </q-card-section>
               </q-card>
               
               <!-- History/Log of Novedades -->
               <q-card flat class="shadow-1">
                 <q-card-section class="q-py-sm">
                    <div class="text-subtitle2 text-grey-8">Historial de Novedades (Resumen)</div>
                 </q-card-section>
                 <q-separator />
                 <q-card-section v-if="currentNominaData">
                    <!-- Simple visualization of what we know -->
                    <q-list dense>
                       <q-item v-if="currentNominaData.horasExtrasDiurnas > 0">
                          <q-item-section>Horas Extras Diurnas</q-item-section>
                          <q-item-section side>{{ currentNominaData.horasExtrasDiurnas }} hrs</q-item-section>
                       </q-item>
                       <q-item v-if="currentNominaData.horasExtrasFestivas > 0">
                          <q-item-section>Horas Extras Festivas/Dom.</q-item-section>
                          <q-item-section side>{{ currentNominaData.horasExtrasFestivas }} hrs</q-item-section>
                       </q-item>
                       <q-item v-if="currentNominaData.otrosPagos > 0">
                          <q-item-section>Otros Pagos (Total)</q-item-section>
                          <q-item-section side class="text-green">{{ formatCurrency(currentNominaData.otrosPagos) }}</q-item-section>
                       </q-item>
                       <q-item v-if="currentNominaData.otrasDeducciones > 0">
                          <q-item-section>Otras Deducciones (Total)</q-item-section>
                          <q-item-section side class="text-red">{{ formatCurrency(currentNominaData.otrasDeducciones) }}</q-item-section>
                       </q-item>
                       
                       <!-- Detailed breakdown if available in array -->
                        <q-expansion-item
                          dense
                          icon="list"
                          label="Ver Detalle Items"
                          class="text-grey-7"
                          v-if="currentNominaData.otrosPagosData?.length || currentNominaData.horasExtrasData?.diurnas?.length"
                        >
                          <div class="q-pl-md">
                             <div v-for="(op, idx) in currentNominaData.otrosPagosData" :key="'op'+idx" class="row justify-between q-py-xs text-caption">
                                <span>{{ op.concepto }}</span>
                                <span>{{ formatCurrency(op.valor) }}</span>
                             </div>

                             <template v-if="currentNominaData.horasExtrasData?.diurnas?.length">
                                 <q-separator class="q-my-xs" />
                                 <div class="text-caption text-weight-bold q-mb-xs text-grey-8">H.E. Diurnas:</div>
                                 <div v-for="(he, idx) in currentNominaData.horasExtrasData.diurnas" :key="'hed'+idx" class="row justify-between q-py-xs text-caption q-pl-sm">
                                    <span>{{ he.fecha.substring(0,10) }}</span>
                                    <span>{{ he.cantidad }}h</span>
                                 </div>
                             </template>

                             <template v-if="currentNominaData.horasExtrasData?.festivas?.length">
                                 <q-separator class="q-my-xs" />
                                 <div class="text-caption text-weight-bold q-mb-xs text-grey-8">H.E. Festivas:</div>
                                 <div v-for="(he, idx) in currentNominaData.horasExtrasData.festivas" :key="'hef'+idx" class="row justify-between q-py-xs text-caption q-pl-sm">
                                    <span>{{ he.fecha.substring(0,10) }}</span>
                                    <span>{{ he.cantidad }}h</span>
                                 </div>
                             </template>
                          </div>
                        </q-expansion-item>

                    </q-list>
                 </q-card-section>
                 <q-card-section v-else class="text-center text-grey">
                    Seleccione un empleado para ver historial
                 </q-card-section>
               </q-card>
            </div>
            
            <!-- Right: Summary Card -->
             <div class="col-12 col-md-5">
                <q-card flat class="bg-primary text-white shadow-2">
                   <q-card-section>
                      <div class="text-h6">Resumen de Nómina</div>
                      <div class="text-caption">Cálculo Estimado</div>
                   </q-card-section>
                   <q-separator dark />
                   <q-card-section v-if="currentNominaData">
                      <!-- We need to calculate totals here or use the ones from backend if updated -->
                      <!-- For strictly correct data, we might need to trigger 'calculate' often or compute locally -->
                      
                      <div class="row justify-between q-mb-sm">
                         <span>Salario Base</span>
                         <span class="text-weight-bold">{{ formatCurrency(currentNominaData.empleado.salario_mensual) }}</span>
                      </div>
                      
                      <!-- Computed Totals Block -->
                      <div class="bg-white text-dark q-pa-sm rounded-borders q-mt-md">
                         <div class="row justify-between q-mb-xs">
                           <span class="text-grey-8">Total Devengado</span>
                           <span class="text-weight-bold text-green-8">
                             <!-- Placeholder or calculated -->
                             {{ formatCurrency(calculateTotals(currentNominaData).devengado) }}
                           </span>
                         </div>
                         <div class="row justify-between q-mb-xs">
                           <span class="text-grey-8">Total Deducciones</span>
                           <span class="text-weight-bold text-red-8">
                             {{ formatCurrency(calculateTotals(currentNominaData).deducciones) }}
                           </span>
                         </div>
                         <q-separator class="q-my-sm" />
                         <div class="row justify-between text-h6">
                           <span>Neto a Pagar</span>
                           <span class="text-primary">{{ formatCurrency(calculateTotals(currentNominaData).neto) }}</span>
                         </div>
                      </div>

                      <div class="q-mt-sm text-center">
                          <q-badge color="info" class="cursor-pointer" outline>
                             <q-icon name="info" class="q-mr-xs"/>
                             Parámetros Usados
                             <q-tooltip class="bg-dark text-body2">
                                 <div><strong>Aux. Transporte:</strong> {{ formatCurrency(calculateTotals(currentNominaData).parametrosUsados.auxTransporte) }}</div>
                                 <div><strong>Salud:</strong> {{ calculateTotals(currentNominaData).parametrosUsados.saludPct }}%</div>
                                 <div><strong>Pensión:</strong> {{ calculateTotals(currentNominaData).parametrosUsados.pensionPct }}%</div>
                                 <q-separator class="q-my-xs bg-grey-8" />
                                 <div><strong>Factor HE Diurna:</strong> x{{ calculateTotals(currentNominaData).parametrosUsados.factorHED }}</div>
                                 <div><strong>Factor HE Festiva:</strong> x{{ calculateTotals(currentNominaData).parametrosUsados.factorHEF }}</div>
                                 <div><strong>Horas Laborales Mes:</strong> {{ calculateTotals(currentNominaData).parametrosUsados.horasMes }}h</div>
                             </q-tooltip>
                          </q-badge>
                      </div>
                      
                   </q-card-section>
                   <q-card-section v-else class="text-center">
                      ...
                   </q-card-section>
                </q-card>
             </div>
         </div>
      </div>
      
      <!-- Empty State -->
      <div class="col-12 col-md-9 flex flex-center text-grey-5" v-else>
         <div class="text-center">
            <q-icon name="person_search" size="4em" />
            <div class="text-h6">Seleccione un empleado para gestionar su nómina</div>
         </div>
      </div>
    </div>
    
    <div class="absolute-center text-center text-grey-5" v-if="!selectedPeriodId">
       <q-icon name="event_note" size="4em" />
       <div class="text-h5">Seleccione un período para comenzar</div>
    </div>
  </q-page>
</template>

<style scoped>
.period-select {
  min-width: 250px;
}
</style>

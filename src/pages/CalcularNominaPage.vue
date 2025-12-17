<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { nominasService } from '../services/api/nomina.service';
import { periodoNominaService } from '../services/api/periodo-nomina.service';
import { empleadoService } from '../services/api/empleado.service';
import type { PeriodoNomina } from '../types/periodo-nomina';
import type { Empleado } from '../types/empleado';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const periodoId = ref<number | null>(null);
const periodo = ref<PeriodoNomina | null>(null);
const periodos = ref<PeriodoNomina[]>([]);
const empleadosData = ref<any[]>([]);
const empresaId = ref(1); // TODO: obtener del store de auth

interface EmpleadoNominaRow {
  empleado: Empleado;
  nomina: any;
  horasExtrasDiurnas: number;
  horasExtrasFestivas: number;
  otrosPagos: number;
  otrasDeducciones: number;
  horasExtrasData: { diurnas: any[]; festivas: any[] };
  otrosPagosData: any[];
}

const loadPeriodos = async () => {
  try {
    console.log('Cargando períodos de nómina...');
    const response = await periodoNominaService.getPeriodos({ page: 1, limit: 100 });
    console.log('Respuesta de períodos:', response);

    periodos.value = response.data || [];
    console.log('Períodos cargados:', periodos.value.length);

    if (periodos.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No hay períodos de nómina creados. Por favor cree un período primero.',
        caption: 'Vaya a Nómina > Períodos > + Nuevo Período',
        actions: [
          {
            label: 'Crear Período',
            color: 'white',
            handler: () => {
              router.push('/periodos-nomina/new');
            }
          }
        ],
        timeout: 8000,
        position: 'top'
      });
    }

    if (route.query.periodoId) {
      periodoId.value = Number(route.query.periodoId);
      await loadData();
    }
  } catch (error: any) {
    console.error('Error al cargar períodos:', error);
    console.error('Detalles del error:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });

    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Error al cargar los períodos de nómina',
      caption: error?.response?.status === 401
        ? 'Por favor inicie sesión nuevamente'
        : 'Revise la consola para más detalles',
      timeout: 5000,
      position: 'top'
    });
  }
};

const loadData = async () => {
  if (!periodoId.value) return;

  try {
    loading.value = true;
    console.log('Cargando empleados para período:', periodoId.value);

    const data = await nominasService.getEmpleadosConNominas(periodoId.value);
    console.log('Empleados recibidos:', data);
    console.log('Cantidad de empleados:', data?.length || 0);

    empleadosData.value = data || [];

    // Cargar período
    periodo.value = await periodoNominaService.getPeriodo(periodoId.value);
    console.log('Período cargado:', periodo.value);

    if (empleadosData.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No hay empleados activos para calcular nómina',
        caption: 'Primero debe crear empleados activos en el sistema',
        actions: [
          {
            label: 'Ir a Empleados',
            color: 'white',
            handler: () => {
              router.push('/empleados');
            }
          }
        ],
        timeout: 8000,
        position: 'top'
      });
    }
  } catch (error: any) {
    console.error('Error al cargar datos:', error);
    console.error('Detalles del error:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });

    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Error al cargar los datos',
      caption: 'Revise la consola del navegador para más detalles',
      timeout: 5000,
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const calcularValorHora = (salarioMensual: number) => {
  return salarioMensual / 220;
};

const calcularSalarioBasico = (salarioMensual: number, diasPeriodo: number) => {
  if (diasPeriodo === 15) {
    return salarioMensual / 2;
  }
  return (salarioMensual / 30) * diasPeriodo;
};

const calcularHEDiurna = (row: EmpleadoNominaRow, valorHora: number) => {
  return row.horasExtrasDiurnas * valorHora * 1.25;
};

const calcularHEFestiva = (row: EmpleadoNominaRow, valorHora: number) => {
  return row.horasExtrasFestivas * valorHora * 1.75;
};

const calcularAuxilioTransporte = (row: EmpleadoNominaRow, diasPeriodo: number) => {
  if (!row.empleado.auxilio_transporte) return 0;
  const auxilioMensual = 200000; // TODO: obtener de parámetros
  if (diasPeriodo === 15) {
    return auxilioMensual / 2;
  }
  return (auxilioMensual / 30) * diasPeriodo;
};

const calcularSalud = (salarioBasico: number) => {
  return salarioBasico * 0.04;
};

const calcularPension = (salarioBasico: number) => {
  return salarioBasico * 0.04;
};

const calcularTotales = (row: EmpleadoNominaRow) => {
  const valorHora = calcularValorHora(row.empleado.salario_mensual);
  const diasPeriodo = periodo.value?.dias_periodo || 15;
  const salarioBasico = calcularSalarioBasico(row.empleado.salario_mensual, diasPeriodo);
  const heDiurna = calcularHEDiurna(row, valorHora);
  const heFestiva = calcularHEFestiva(row, valorHora);
  const auxTransporte = calcularAuxilioTransporte(row, diasPeriodo);
  const salud = calcularSalud(salarioBasico);
  const pension = calcularPension(salarioBasico);

  const totalDevengado = salarioBasico + heDiurna + heFestiva + auxTransporte + row.otrosPagos;
  const totalDeducciones = salud + pension + row.otrasDeducciones;
  const netoPagar = totalDevengado - totalDeducciones;

  return {
    salarioBasico,
    heDiurna,
    heFestiva,
    auxTransporte,
    salud,
    pension,
    totalDevengado,
    totalDeducciones,
    netoPagar,
  };
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const handleAgregarHoraExtra = async (row: EmpleadoNominaRow, tipo: 'DIURNA' | 'FESTIVA') => {
  $q.dialog({
    title: `Agregar Hora Extra ${tipo === 'DIURNA' ? 'Diurna' : 'Festiva'}`,
    message: `Empleado: ${row.empleado.nombre_completo}`,
    prompt: {
      model: '',
      type: 'number',
      label: 'Cantidad de horas',
      placeholder: 'Ej: 2.5'
    },
    cancel: true,
    persistent: true
  }).onOk(async (horas: string) => {
    if (!periodoId.value) return;
    
    try {
      await nominasService.crearHoraExtra({
        empleadoId: row.empleado.id,
        periodoId: periodoId.value,
        tipo,
        cantidadHoras: Number(horas),
        fecha: new Date().toISOString().split('T')[0],
        aprobado: true,
      });
      
      $q.notify({
        type: 'positive',
        message: 'Hora extra agregada exitosamente'
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Error al agregar hora extra:', error);
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.message || 'Error al agregar hora extra'
      });
    }
  });
};

const handleAgregarOtroPago = async (row: EmpleadoNominaRow, tipo: 'INGRESO' | 'DEDUCCION') => {
  $q.dialog({
    title: `Agregar ${tipo === 'INGRESO' ? 'Otro Pago' : 'Deducción'}`,
    message: `Empleado: ${row.empleado.nombre_completo}`,
    prompt: {
      model: '',
      type: 'text',
      label: 'Concepto',
      placeholder: 'Ej: Bonificación'
    },
    cancel: true,
    persistent: true
  }).onOk(async (concepto: string) => {
    $q.dialog({
      title: 'Valor',
      prompt: {
        model: '',
        type: 'number',
        label: 'Valor',
        placeholder: 'Ej: 50000'
      },
      cancel: true,
      persistent: true
    }).onOk(async (valor: string) => {
      if (!periodoId.value) return;
      
      try {
        await nominasService.crearOtroPago({
          empleadoId: row.empleado.id,
          periodoId: periodoId.value,
          concepto,
          valor: Number(valor),
          tipo,
          aprobado: true,
        });
        
        $q.notify({
          type: 'positive',
          message: `${tipo === 'INGRESO' ? 'Pago' : 'Deducción'} agregado exitosamente`
        });
        
        await loadData();
      } catch (error: any) {
        console.error('Error al agregar otro pago:', error);
        $q.notify({
          type: 'negative',
          message: error?.response?.data?.message || 'Error al agregar'
        });
      }
    });
  });
};

const handleGenerarNominas = async () => {
  if (!periodoId.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor seleccione un período'
    });
    return;
  }

  $q.dialog({
    title: 'Generar Nóminas',
    message: `¿Desea generar nóminas para todos los empleados activos del período seleccionado?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Generando nóminas...' });
      await nominasService.generarNominasParaPeriodo(periodoId.value!);
      $q.notify({
        type: 'positive',
        message: 'Nóminas generadas exitosamente'
      });
      await loadData();
    } catch (error: any) {
      console.error('Error al generar nóminas:', error);
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.message || 'Error al generar las nóminas'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

const handleCalcularTodas = async () => {
  if (!periodoId.value) return;

  $q.dialog({
    title: 'Calcular Todas las Nóminas',
    message: `¿Desea calcular todas las nóminas del período?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Calculando nóminas...' });
      
      for (const row of empleadosData.value) {
        if (row.nomina) {
          try {
            await nominasService.calcularNomina(row.nomina.id);
          } catch (error) {
            console.error(`Error al calcular nómina ${row.nomina.id}:`, error);
          }
        }
      }
      
      $q.notify({
        type: 'positive',
        message: 'Nóminas calculadas exitosamente'
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Error al calcular nóminas:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al calcular las nóminas'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

onMounted(() => {
  loadPeriodos();
});
</script>

<template>
  <q-page padding>
    <!-- Header -->
    <q-card flat class="q-mb-md shadow-1" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <q-card-section class="text-white">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5 text-weight-bold">
              <q-icon name="calculate" size="32px" class="q-mr-sm" />
              Calcular Nómina
            </div>
            <div class="text-subtitle2 q-mt-xs" style="opacity: 0.9">
              Gestión de nóminas tipo Excel
            </div>
          </div>
          <div class="col-auto">
            <q-select
              v-model="periodoId"
              :options="periodos"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              outlined
              dense
              :placeholder="periodos.length === 0 ? 'No hay períodos disponibles' : 'Seleccionar período...'"
              :disable="periodos.length === 0"
              class="bg-white"
              style="min-width: 250px"
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    <div class="text-center q-pa-md">
                      <q-icon name="info" size="2em" class="q-mb-sm" />
                      <div>No hay períodos creados</div>
                      <q-btn
                        flat
                        color="primary"
                        label="Crear Período"
                        size="sm"
                        class="q-mt-sm"
                        @click="router.push('/periodos-nomina/new')"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Actions Bar -->
    <q-card flat class="q-mb-md shadow-1" v-if="periodoId">
      <q-card-section>
        <div class="row q-gutter-sm">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Generar Nóminas"
            @click="handleGenerarNominas"
            :disable="loading"
          />
          <q-btn
            unelevated
            color="green-7"
            icon="calculate"
            label="Calcular Todas"
            @click="handleCalcularTodas"
            :disable="loading || !empleadosData.length"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat class="shadow-1" v-if="periodoId">
      <q-card-section>
        <div class="text-h6 q-mb-md" v-if="periodo">
          Período: {{ periodo.nombre }} ({{ periodo.dias_periodo }} días)
        </div>
        
        <div class="table-container" style="overflow-x: auto;">
          <table class="nomina-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Salario Mensual</th>
                <th>Valor Hora</th>
                <th>Días</th>
                <th>Salario Básico</th>
                <th>H.E. Diurnas</th>
                <th>H.E. Festivas</th>
                <th>Aux. Transporte</th>
                <th>Otros Pagos</th>
                <th>Total Devengado</th>
                <th>Salud (4%)</th>
                <th>Pensión (4%)</th>
                <th>Otras Deducciones</th>
                <th>Total Deducciones</th>
                <th>Neto a Pagar</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in empleadosData" :key="row.empleado.id">
                <td>{{ row.empleado.nombre_completo }}</td>
                <td class="text-right">{{ formatCurrency(row.empleado.salario_mensual) }}</td>
                <td class="text-right">{{ formatCurrency(calcularValorHora(row.empleado.salario_mensual)) }}</td>
                <td class="text-center">{{ periodo?.dias_periodo || 15 }}</td>
                <td class="text-right">{{ formatCurrency(calcularTotales(row).salarioBasico) }}</td>
                <td class="text-center">
                  <div class="row items-center q-gutter-xs">
                    <span>{{ row.horasExtrasDiurnas.toFixed(2) }}</span>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="add"
                      color="green-7"
                      @click="handleAgregarHoraExtra(row, 'DIURNA')"
                    >
                      <q-tooltip>Agregar Hora Extra Diurna</q-tooltip>
                    </q-btn>
                  </div>
                </td>
                <td class="text-center">
                  <div class="row items-center q-gutter-xs">
                    <span>{{ row.horasExtrasFestivas.toFixed(2) }}</span>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="add"
                      color="orange-7"
                      @click="handleAgregarHoraExtra(row, 'FESTIVA')"
                    >
                      <q-tooltip>Agregar Hora Extra Festiva</q-tooltip>
                    </q-btn>
                  </div>
                </td>
                <td class="text-right">{{ formatCurrency(calcularTotales(row).auxTransporte) }}</td>
                <td class="text-right">
                  <div class="row items-center justify-end q-gutter-xs">
                    <span>{{ formatCurrency(row.otrosPagos) }}</span>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="add"
                      color="blue-7"
                      @click="handleAgregarOtroPago(row, 'INGRESO')"
                    >
                      <q-tooltip>Agregar Otro Pago</q-tooltip>
                    </q-btn>
                  </div>
                </td>
                <td class="text-right text-weight-bold text-primary">
                  {{ formatCurrency(calcularTotales(row).totalDevengado) }}
                </td>
                <td class="text-right">{{ formatCurrency(calcularTotales(row).salud) }}</td>
                <td class="text-right">{{ formatCurrency(calcularTotales(row).pension) }}</td>
                <td class="text-right">
                  <div class="row items-center justify-end q-gutter-xs">
                    <span>{{ formatCurrency(row.otrasDeducciones) }}</span>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="add"
                      color="red-7"
                      @click="handleAgregarOtroPago(row, 'DEDUCCION')"
                    >
                      <q-tooltip>Agregar Deducción</q-tooltip>
                    </q-btn>
                  </div>
                </td>
                <td class="text-right text-weight-bold text-red-7">
                  {{ formatCurrency(calcularTotales(row).totalDeducciones) }}
                </td>
                <td class="text-right text-weight-bold text-green-7" style="font-size: 1.1em">
                  {{ formatCurrency(calcularTotales(row).netoPagar) }}
                </td>
                <td>
                  <q-btn
                    v-if="row.nomina"
                    flat
                    dense
                    round
                    icon="visibility"
                    color="blue-7"
                    @click="router.push(`/nominas/${row.nomina.id}`)"
                  >
                    <q-tooltip>Ver Detalle</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="row.nomina && row.nomina.estado === 'BORRADOR'"
                    flat
                    dense
                    round
                    icon="calculate"
                    color="green-7"
                    @click="nominasService.calcularNomina(row.nomina.id).then(() => loadData())"
                  >
                    <q-tooltip>Calcular</q-tooltip>
                  </q-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!empleadosData.length && !loading" class="text-center q-pa-xl text-grey-7">
          <q-icon name="people_outline" size="4em" class="q-mb-md" />
          <div class="text-h6 q-mb-md">No hay empleados activos</div>
          <div class="q-mb-md">Para calcular nóminas necesita tener empleados activos en el sistema</div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Ir a Empleados"
            @click="router.push('/empleados')"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card flat class="shadow-1" v-else>
      <q-card-section class="text-center q-pa-xl text-grey-7">
        <q-icon name="event" size="3em" class="q-mb-md" />
        <div>Por favor seleccione un período para comenzar</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped lang="scss">
.table-container {
  max-width: 100%;
}

.nomina-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th, td {
    padding: 8px 12px;
    text-align: left;
    border: 1px solid #e0e0e0;
    white-space: nowrap;
  }

  th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tbody tr {
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f5f5f5;
    }

    &:nth-child(even) {
      background-color: #fafafa;
      
      &:hover {
        background-color: #f0f0f0;
      }
    }
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }
}
</style>


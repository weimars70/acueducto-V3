<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { nominasService } from '../services/api/nomina.service';
import { periodoNominaService } from '../services/api/periodo-nomina.service';
import type { Nomina } from '../types/nomina';
import type { PeriodoNomina } from '../types/periodo-nomina';
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const router = useRouter();
const { exportToExcel, exportToPDF } = useExport();
const nominas = ref<Nomina[]>([]);
const periodos = ref<PeriodoNomina[]>([]);
const loading = ref(true);
const filter = ref('');
const periodoFiltro = ref<number | null>(null);
const estadoFiltro = ref<string>('');
const viewMode = ref<'table' | 'grid'>('table');
const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 12,
  rowsNumber: 0
});

const columns = [
  { name: 'empleado_nombre', label: 'Empleado', field: 'empleado_nombre', align: 'left' as const, sortable: true },
  { name: 'periodo_nombre', label: 'Período', field: 'periodo_nombre', align: 'left' as const, sortable: true },
  { name: 'dias_pagados', label: 'Días', field: 'dias_pagados', align: 'center' as const },
  { name: 'total_devengado', label: 'Devengado', field: 'total_devengado', align: 'right' as const, sortable: true },
  { name: 'total_deducciones', label: 'Deducciones', field: 'total_deducciones', align: 'right' as const, sortable: true },
  { name: 'neto_pagar', label: 'Neto a Pagar', field: 'neto_pagar', align: 'right' as const, sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const loadPeriodos = async () => {
  try {
    const response = await periodoNominaService.getPeriodos({ page: 1, limit: 100 });
    periodos.value = response.data || [];
  } catch (error) {
    console.error('Error al cargar períodos:', error);
  }
};

const loadData = async () => {
  try {
    loading.value = true;
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
    };

    if (periodoFiltro.value) {
      params.periodoId = periodoFiltro.value;
    }

    if (estadoFiltro.value) {
      params.estado = estadoFiltro.value;
    }

    const response = await nominasService.getNominas(params);

    if (response && response.data) {
      nominas.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      nominas.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar nóminas:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las nóminas'
    });
    nominas.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const onRequest = (props: any) => {
  const { page, rowsPerPage } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  loadData();
};

const handleView = (nomina: Nomina) => {
  router.push(`/nominas/${nomina.id}`);
};

const handleCalcular = async (nomina: Nomina) => {
  try {
    $q.loading.show({ message: 'Calculando nómina...' });
    await nominasService.calcularNomina(nomina.id);
    $q.notify({
      type: 'positive',
      message: 'Nómina calculada exitosamente'
    });
    loadData();
  } catch (error: any) {
    console.error('Error al calcular nómina:', error);
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Error al calcular la nómina'
    });
  } finally {
    $q.loading.hide();
  }
};

const handleAprobar = async (nomina: Nomina) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de aprobar la nómina de ${nomina.empleado_nombre || 'empleado'}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await nominasService.aprobarNomina({ nominaId: nomina.id });
      $q.notify({
        type: 'positive',
        message: 'Nómina aprobada exitosamente'
      });
      loadData();
    } catch (error: any) {
      console.error('Error al aprobar nómina:', error);
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.message || 'Error al aprobar la nómina'
      });
    }
  });
};

const handlePagar = async (nomina: Nomina) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de marcar como pagada la nómina de ${nomina.empleado_nombre || 'empleado'}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await nominasService.marcarComoPagado(nomina.id);
      $q.notify({
        type: 'positive',
        message: 'Nómina marcada como pagada exitosamente'
      });
      loadData();
    } catch (error: any) {
      console.error('Error al marcar nómina como pagada:', error);
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.message || 'Error al marcar la nómina como pagada'
      });
    }
  });
};

const handleGenerarNominas = async () => {
  if (!periodoFiltro.value) {
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
      const result = await nominasService.generarNominasParaPeriodo(periodoFiltro.value!);
      $q.notify({
        type: 'positive',
        message: result.message
      });
      loadData();
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'BORRADOR': return 'grey';
    case 'APROBADO': return 'warning';
    case 'PAGADO': return 'positive';
    default: return 'grey';
  }
};

const filteredNominas = computed(() => {
  let result = nominas.value;

  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    result = result.filter(n =>
      n.empleado_nombre?.toLowerCase().includes(searchTerm) ||
      n.periodo_nombre?.toLowerCase().includes(searchTerm)
    );
  }

  return result;
});

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'empleado_nombre', label: 'Empleado' },
      { field: 'periodo_nombre', label: 'Período' },
      { field: 'dias_pagados', label: 'Días' },
      { field: 'total_devengado', label: 'Devengado' },
      { field: 'total_deducciones', label: 'Deducciones' },
      { field: 'neto_pagar', label: 'Neto a Pagar' },
      { field: 'estado', label: 'Estado' }
    ];

    const dataToExport = filteredNominas.value.map(n => ({
      ...n,
      total_devengado: formatCurrency(n.total_devengado),
      total_deducciones: formatCurrency(n.total_deducciones),
      neto_pagar: formatCurrency(n.neto_pagar)
    }));

    exportToExcel(dataToExport, exportColumns, 'nominas');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'empleado_nombre', label: 'Empleado' },
      { field: 'periodo_nombre', label: 'Período' },
      { field: 'dias_pagados', label: 'Días' },
      { field: 'total_devengado', label: 'Devengado' },
      { field: 'total_deducciones', label: 'Deducciones' },
      { field: 'neto_pagar', label: 'Neto a Pagar' },
      { field: 'estado', label: 'Estado' }
    ];

    const dataToExport = filteredNominas.value.map(n => ({
      ...n,
      total_devengado: formatCurrency(n.total_devengado),
      total_deducciones: formatCurrency(n.total_deducciones),
      neto_pagar: formatCurrency(n.neto_pagar)
    }));

    exportToPDF(dataToExport, exportColumns, 'nominas', 'Listado de Nóminas');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

onMounted(() => {
  loadPeriodos();
  loadData();
});
</script>

<template>
  <q-page padding>
    <!-- Header Card -->
    <q-card flat class="q-mb-md shadow-1" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <q-card-section class="text-white">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5 text-weight-bold">
              <q-icon name="payments" size="32px" class="q-mr-sm" />
              Nóminas
            </div>
            <div class="text-subtitle2 q-mt-xs" style="opacity: 0.9">
              Gestión y cálculo de nóminas
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              rounded
              icon="add"
              label="Generar Nóminas"
              color="white"
              text-color="purple-9"
              size="md"
              class="q-px-lg shadow-3 q-mr-sm"
              @click="handleGenerarNominas"
              style="font-weight: 600;"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Filters Card -->
    <q-card flat class="q-mb-md shadow-1">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-select
              v-model="periodoFiltro"
              :options="periodos"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              outlined
              dense
              placeholder="Filtrar por período..."
              clearable
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="purple-7" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="estadoFiltro"
              :options="[
                { label: 'Todos', value: '' },
                { label: 'Borrador', value: 'BORRADOR' },
                { label: 'Aprobado', value: 'APROBADO' },
                { label: 'Pagado', value: 'PAGADO' }
              ]"
              outlined
              dense
              placeholder="Filtrar por estado..."
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="filter_list" color="purple-7" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="filter"
              outlined
              dense
              placeholder="Buscar por empleado o período..."
              style="border-radius: 12px;"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="purple-7" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-2">
            <div class="row justify-end q-gutter-sm">
              <q-btn
                outline
                rounded
                color="green-7"
                icon="file_download"
                label="Excel"
                @click="handleExportExcel"
                :disable="!nominas.length"
                class="q-px-md"
              />
              <q-btn
                outline
                rounded
                color="red-7"
                icon="picture_as_pdf"
                label="PDF"
                @click="handleExportPDF"
                :disable="!nominas.length"
                class="q-px-md"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table View -->
    <q-card flat class="shadow-1">
      <q-table
        flat
        :rows="filteredNominas"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[12, 24, 48]"
        binary-state-sort
      >
        <template v-slot:body-cell-total_devengado="props">
          <q-td :props="props">{{ formatCurrency(props.row.total_devengado) }}</q-td>
        </template>

        <template v-slot:body-cell-total_deducciones="props">
          <q-td :props="props">{{ formatCurrency(props.row.total_deducciones) }}</q-td>
        </template>

        <template v-slot:body-cell-neto_pagar="props">
          <q-td :props="props">
            <span class="text-weight-bold text-primary">
              {{ formatCurrency(props.row.neto_pagar) }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip
              :color="getEstadoColor(props.row.estado)"
              text-color="white"
              size="sm"
            >
              {{ props.row.estado }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              icon="visibility"
              color="blue-7"
              size="sm"
              @click="handleView(props.row)"
            >
              <q-tooltip>Ver Detalle</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.estado === 'BORRADOR'"
              flat
              dense
              round
              icon="calculate"
              color="green-7"
              size="sm"
              @click="handleCalcular(props.row)"
            >
              <q-tooltip>Calcular</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.estado === 'BORRADOR'"
              flat
              dense
              round
              icon="check"
              color="orange-7"
              size="sm"
              @click="handleAprobar(props.row)"
            >
              <q-tooltip>Aprobar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.estado === 'APROBADO'"
              flat
              dense
              round
              icon="payments"
              color="positive"
              size="sm"
              @click="handlePagar(props.row)"
            >
              <q-tooltip>Marcar como Pagado</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon name="info" size="2em" color="grey-5" />
            <span class="text-grey-7">
              No hay nóminas registradas
            </span>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>


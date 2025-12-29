<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { periodoNominaService } from '../services/api/periodo-nomina.service';
import type { PeriodoNomina } from '../types/periodo-nomina';
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const router = useRouter();
const { exportToExcel, exportToPDF } = useExport();
const periodos = ref<PeriodoNomina[]>([]);
const loading = ref(true);
const filter = ref('');
const viewMode = ref<'table' | 'grid'>('table');
const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 12,
  rowsNumber: 0
});

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'fecha_inicio', label: 'Fecha Inicio', field: 'fecha_inicio', align: 'center' as const, sortable: true },
  { name: 'fecha_fin', label: 'Fecha Fin', field: 'fecha_fin', align: 'center' as const, sortable: true },
  { name: 'dias_periodo', label: 'Días', field: 'dias_periodo', align: 'center' as const },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const filteredPeriodos = computed(() => {
  if (!filter.value) return periodos.value;
  const searchTerm = filter.value.toLowerCase();
  return periodos.value.filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm) ||
    p.estado?.toLowerCase().includes(searchTerm)
  );
});

const loadData = async () => {
  try {
    loading.value = true;
    const response = await periodoNominaService.getPeriodos({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
    });

    if (response && response.data) {
      periodos.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      periodos.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar períodos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los períodos de nómina'
    });
    periodos.value = [];
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

const handleNew = () => {
  router.push('/periodos-nomina/new');
};

const handleEdit = (periodo: PeriodoNomina) => {
  router.push(`/periodos-nomina/edit/${periodo.id}`);
};

const handleDelete = async (periodo: PeriodoNomina) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el período ${periodo.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await periodoNominaService.delete(periodo.id);
      $q.notify({
        type: 'positive',
        message: 'Período eliminado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar período:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el período'
      });
    }
  });
};

const handleCerrar = async (periodo: PeriodoNomina) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de cerrar el período ${periodo.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await periodoNominaService.cerrar(periodo.id);
      $q.notify({
        type: 'positive',
        message: 'Período cerrado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al cerrar período:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al cerrar el período'
      });
    }
  });
};

const handlePagar = async (periodo: PeriodoNomina) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de marcar como pagado el período ${periodo.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await periodoNominaService.pagar(periodo.id);
      $q.notify({
        type: 'positive',
        message: 'Período marcado como pagado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al marcar período como pagado:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al marcar el período como pagado'
      });
    }
  });
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('es-CO');
};

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'ABIERTO': return 'positive';
    case 'CERRADO': return 'warning';
    case 'PAGADO': return 'info';
    default: return 'grey';
  }
};

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'nombre', label: 'Nombre' },
      { field: 'fecha_inicio', label: 'Fecha Inicio' },
      { field: 'fecha_fin', label: 'Fecha Fin' },
      { field: 'dias_periodo', label: 'Días' },
      { field: 'estado', label: 'Estado' }
    ];
    
    // Preparar datos con fechas formateadas
    const dataToExport = filteredPeriodos.value.map(p => ({
      ...p,
      fecha_inicio: formatDate(p.fecha_inicio),
      fecha_fin: formatDate(p.fecha_fin)
    }));
    
    exportToExcel(dataToExport, exportColumns, 'periodos-nomina');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'nombre', label: 'Nombre' },
      { field: 'fecha_inicio', label: 'Fecha Inicio' },
      { field: 'fecha_fin', label: 'Fecha Fin' },
      { field: 'dias_periodo', label: 'Días' },
      { field: 'estado', label: 'Estado' }
    ];
    
    // Preparar datos con fechas formateadas
    const dataToExport = filteredPeriodos.value.map(p => ({
      ...p,
      fecha_inicio: formatDate(p.fecha_inicio),
      fecha_fin: formatDate(p.fecha_fin)
    }));
    
    exportToPDF(dataToExport, exportColumns, 'periodos-nomina', 'Períodos de Nómina');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

onMounted(() => {
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
              <q-icon name="event" size="32px" class="q-mr-sm" />
              Períodos de Nómina
            </div>
            <div class="text-subtitle2 q-mt-xs" style="opacity: 0.9">
              Gestión de períodos de liquidación
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              rounded
              icon="add"
              label="Nuevo Período"
              color="white"
              text-color="purple-9"
              size="md"
              class="q-px-lg shadow-3"
              @click="handleNew"
              style="font-weight: 600;"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Filters and Actions Card -->
    <q-card flat class="q-mb-md shadow-1">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filter"
              outlined
              dense
              placeholder="Buscar por nombre o estado..."
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
          <div class="col-12 col-md-6">
            <div class="row justify-end q-gutter-sm">
              <q-btn
                outline
                rounded
                color="green-7"
                icon="file_download"
                label="Excel"
                @click="handleExportExcel"
                :disable="!periodos.length"
                class="q-px-md"
              />
              <q-btn
                outline
                rounded
                color="red-7"
                icon="picture_as_pdf"
                label="PDF"
                @click="handleExportPDF"
                :disable="!periodos.length"
                class="q-px-md"
              />
              <q-btn-toggle
                v-model="viewMode"
                rounded
                outline
                toggle-color="purple-7"
                color="grey-7"
                :options="[
                  {label: 'Tabla', value: 'table', icon: 'view_list'},
                  {label: 'Tarjetas', value: 'grid', icon: 'view_module'}
                ]"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table View -->
    <q-card flat class="shadow-1" v-if="viewMode === 'table'">
      <q-table
        flat
        :rows="filteredPeriodos"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[12, 24, 48]"
        binary-state-sort
      >
        <template v-slot:body-cell-fecha_inicio="props">
          <q-td :props="props">{{ formatDate(props.row.fecha_inicio) }}</q-td>
        </template>

        <template v-slot:body-cell-fecha_fin="props">
          <q-td :props="props">{{ formatDate(props.row.fecha_fin) }}</q-td>
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
              icon="edit"
              color="blue-7"
              size="sm"
              @click="handleEdit(props.row)"
              :disable="props.row.estado !== 'ABIERTO'"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.estado === 'ABIERTO'"
              flat
              dense
              round
              icon="lock"
              color="orange-7"
              size="sm"
              @click="handleCerrar(props.row)"
            >
              <q-tooltip>Cerrar Período</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.estado === 'CERRADO'"
              flat
              dense
              round
              icon="payments"
              color="green-7"
              size="sm"
              @click="handlePagar(props.row)"
            >
              <q-tooltip>Marcar como Pagado</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="red-7"
              size="sm"
              @click="handleDelete(props.row)"
              :disable="props.row.estado !== 'ABIERTO'"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon name="info" size="2em" color="grey-5" />
            <span class="text-grey-7">
              No hay períodos de nómina registrados
            </span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Grid View -->
    <div v-else class="row q-col-gutter-md">
      <div v-if="loading" class="col-12">
        <div class="row q-col-gutter-md">
          <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
            <q-skeleton height="250px" />
          </div>
        </div>
      </div>
      <div v-else-if="!filteredPeriodos.length" class="col-12">
        <q-card flat class="text-center q-pa-xl">
          <q-icon name="info" size="4em" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            No hay períodos de nómina registrados
          </div>
        </q-card>
      </div>
      <div
        v-else
        v-for="periodo in filteredPeriodos"
        :key="periodo.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card flat class="shadow-1 q-hoverable" style="border-radius: 16px; height: 100%;">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="col">
                <div class="text-h6 text-weight-bold text-grey-9">
                  {{ periodo.nombre }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip
                  :color="getEstadoColor(periodo.estado)"
                  text-color="white"
                  size="sm"
                >
                  {{ periodo.estado }}
                </q-chip>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="text-body2 q-mb-xs">
              <q-icon name="event" size="xs" class="q-mr-xs" />
              <span class="text-grey-7">Fecha Inicio:</span>
              <span class="text-weight-medium q-ml-xs">
                {{ formatDate(periodo.fecha_inicio) }}
              </span>
            </div>

            <div class="text-body2 q-mb-xs">
              <q-icon name="event" size="xs" class="q-mr-xs" />
              <span class="text-grey-7">Fecha Fin:</span>
              <span class="text-weight-medium q-ml-xs">
                {{ formatDate(periodo.fecha_fin) }}
              </span>
            </div>

            <div class="text-body2 q-mb-md">
              <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
              <span class="text-grey-7">Días:</span>
              <span class="text-weight-medium q-ml-xs">
                {{ periodo.dias_periodo }}
              </span>
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                outline
                rounded
                color="blue-7"
                icon="edit"
                label="Editar"
                size="sm"
                class="col"
                @click="handleEdit(periodo)"
                :disable="periodo.estado !== 'ABIERTO'"
              />
              <q-btn
                v-if="periodo.estado === 'ABIERTO'"
                outline
                rounded
                color="orange-7"
                icon="lock"
                label="Cerrar"
                size="sm"
                class="col"
                @click="handleCerrar(periodo)"
              />
              <q-btn
                v-if="periodo.estado === 'CERRADO'"
                outline
                rounded
                color="green-7"
                icon="payments"
                label="Pagar"
                size="sm"
                class="col"
                @click="handlePagar(periodo)"
              />
            </div>

            <div class="row q-gutter-sm q-mt-sm" v-if="periodo.estado === 'ABIERTO'">
              <q-btn
                outline
                rounded
                color="red-7"
                icon="delete"
                label="Eliminar"
                size="sm"
                class="col"
                @click="handleDelete(periodo)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>


<style scoped>
.export-btn {
  min-width: 90px;
  height: 36px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

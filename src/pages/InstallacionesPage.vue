<template>
  <q-page class="full-width-page">
    <div class="page-container">
    

      <!-- Tabla -->
      <div class="table-card">
        <q-table
          flat
          :rows="instalaciones"
          :columns="columns"
          row-key="codigo"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="[10, 20, 50, 100]"
          class="sticky-header-table"
          :pagination-label="paginationLabel"
          rows-per-page-label="Filas por página:"
          no-data-label="No hay datos disponibles"
          no-results-label="No se encontraron resultados"
          loading-label="Cargando..."
        >
          <template v-slot:top>
            <div class="table-header">
              <div class="header-left">
                  <span class="table-title">Gestión de instalaciones y suscriptores    Filtros de Búsqueda</span>
                <q-chip
                  dense
                  icon="info"
                  color="blue-grey-2"
                  text-color="blue-grey-8"
                  size="sm"
                >
                  <q-icon name="open_with" size="16px" class="q-mr-xs" />
                  <span style="font-size: 11px;">Arrastra las columnas para reordenar</span>
                </q-chip>
              </div>
              <div class="header-right">
                <q-btn
                  flat
                  dense
                  icon="add_circle"
                  label="Nueva Instalación"
                  @click="handleNew"
                  class="new-btn"
                >
                  <q-tooltip>Crear nueva instalación</q-tooltip>
                </q-btn>
                <q-separator vertical inset class="q-mx-sm" />
                <q-btn
                  flat
                  dense
                  icon="refresh"
                  label="Restablecer Orden"
                  @click="resetColumnOrder"
                  class="export-btn"
                >
                  <q-tooltip>Restablecer orden de columnas</q-tooltip>
                </q-btn>
                <q-separator vertical inset class="q-mx-sm" />
                <q-btn
                  flat
                  dense
                  color="positive"
                  icon="description"
                  label="Excel"
                  @click="handleExportExcel"
                  class="export-btn"
                >
                  <q-tooltip>Exportar a Excel</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  color="negative"
                  icon="picture_as_pdf"
                  label="PDF"
                  @click="handleExportPDF"
                  class="export-btn"
                >
                  <q-tooltip>Exportar a PDF</q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
            <q-tr>
              <q-th v-for="col in columns" :key="`filter-${col.name}`">
                <!-- Filtro para Suscriptor -->
                <q-input
                  v-if="col.name === 'suscriptor'"
                  v-model="filters.suscriptor"
                  dense
                  outlined
                  placeholder="Buscar..."
                  @keyup.enter="applyFilters"
                  clearable
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <!-- Filtro para Ruta -->
                <q-input
                  v-else-if="col.name === 'sector_nombre'"
                  v-model="filters.sector_nombre"
                  dense
                  outlined
                  placeholder="Buscar..."
                  @keyup.enter="applyFilters"
                  clearable
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <!-- Filtro para Código -->
                <q-input
                  v-else-if="col.name === 'codigo'"
                  v-model="filters.codigo"
                  dense
                  outlined
                  placeholder="Buscar..."
                  @keyup.enter="applyFilters"
                  clearable
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <!-- Filtro para Nombre -->
                <q-input
                  v-else-if="col.name === 'nombre'"
                  v-model="filters.nombre"
                  dense
                  outlined
                  placeholder="Buscar..."
                  @keyup.enter="applyFilters"
                  clearable
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <!-- Filtro para Identificación -->
                <q-input
                  v-else-if="col.name === 'ident'"
                  v-model="filters.ident"
                  dense
                  outlined
                  placeholder="Buscar..."
                  @keyup.enter="applyFilters"
                  clearable
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <!-- Filtro para Dirección -->
                <q-input
                  v-else-if="col.name === 'direccion'"
                  v-model="filters.direccion"
                  dense
                  outlined
                  placeholder="Buscar..."
                  @keyup.enter="applyFilters"
                  clearable
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <!-- Filtro para Activo -->
                <q-select
                  v-else-if="col.name === 'activo'"
                  v-model="filters.activo"
                  :options="activoOptions"
                  dense
                  outlined
                  emit-value
                  map-options
                  clearable
                  @update:model-value="applyFilters"
                />

                <!-- Sin filtro para acciones -->
                <div v-else-if="col.name === 'actions'" style="min-height: 40px;"></div>

                <!-- Filtros deshabilitados para otras columnas -->
                <q-input
                  v-else
                  dense
                  outlined
                  placeholder="Buscar..."
                  disable
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </q-th>
            </q-tr>
          </template>

          <!-- Templates con resaltado de texto -->
          <template v-slot:body-cell-suscriptor="props">
            <q-td :props="props">
              <span v-html="highlightText(props.row.suscriptor, filters.suscriptor)"></span>
            </q-td>
          </template>

          <template v-slot:body-cell-sector_nombre="props">
            <q-td :props="props">
              <span v-html="highlightText(props.row.sector_nombre, filters.sector_nombre)"></span>
            </q-td>
          </template>

          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <span v-html="highlightText(props.row.codigo, filters.codigo)"></span>
            </q-td>
          </template>

          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <span v-html="highlightText(props.row.nombre, filters.nombre)"></span>
            </q-td>
          </template>

          <template v-slot:body-cell-ident="props">
            <q-td :props="props">
              <span v-html="highlightText(props.row.ident, filters.ident)"></span>
            </q-td>
          </template>

          <template v-slot:body-cell-direccion="props">
            <q-td :props="props">
              <span v-html="highlightText(props.row.direccion, filters.direccion)"></span>
            </q-td>
          </template>

          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.activo ? 'positive' : 'negative'"
                :label="props.row.activo ? 'Activo' : 'Inactivo'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-saldo_a_favor="props">
            <q-td :props="props">
              <span :class="props.row.saldo_a_favor > 0 ? 'text-positive' : ''">
                {{ formatCurrency(props.row.saldo_a_favor || 0) }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                color="primary"
                icon="edit"
                @click="handleEdit(props.row.codigo)"
                size="sm"
              >
                <q-tooltip>Editar instalación</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { apiClient } from '../services/api/client';
import { useExport, type ExportColumn } from '../composables/useExport';
import Sortable from 'sortablejs';

const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const instalaciones = ref<any[]>([]);
const filters = ref({
  suscriptor: '',
  sector_nombre: '',
  codigo: '',
  nombre: '',
  ident: '',
  telefono: '',
  direccion: '',
  activo: null as boolean | null
});

const pagination = ref({
  sortBy: 'codigo',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const activoOptions = [
  { label: 'Todos', value: null },
  { label: 'Activo', value: true },
  { label: 'Inactivo', value: false }
];

// Definición de columnas por defecto
const defaultColumns = [
  {
    name: 'suscriptor',
    required: true,
    label: 'Suscriptor',
    align: 'left' as const,
    field: 'suscriptor',
    sortable: true,
    style: 'width: 10%;'
  },
  {
    name: 'sector_nombre',
    required: true,
    label: 'Ruta',
    align: 'left' as const,
    field: 'sector_nombre',
    sortable: true,
    style: 'width: 8%;'
  },
  {
    name: 'codigo',
    required: true,
    label: 'Código',
    align: 'left' as const,
    field: 'codigo',
    sortable: true,
    style: 'width: 5%;'
  },
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left' as const,
    field: 'nombre',
    sortable: true,
    style: 'width: 13%;'
  },
  {
    name: 'ident',
    required: true,
    label: 'Identificación',
    align: 'left' as const,
    field: 'ident',
    sortable: true,
    style: 'width: 8%;'
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    align: 'left' as const,
    field: 'telefono',
    sortable: false,
    style: 'width: 7%;'
  },
  {
    name: 'estrato_nombre',
    label: 'Estrato',
    align: 'left' as const,
    field: 'estrato_nombre',
    sortable: false,
    style: 'width: 6%;'
  },
  {
    name: 'direccion',
    label: 'Dirección',
    align: 'left' as const,
    field: 'direccion',
    sortable: true,
    style: 'width: 13%;'
  },
  {
    name: 'activo',
    label: 'Activo',
    align: 'center' as const,
    field: 'activo',
    sortable: true,
    style: 'width: 6%;'
  },
  {
    name: 'n_centro_costos',
    label: 'Centro Costos',
    align: 'left' as const,
    field: 'n_centro_costos',
    sortable: false,
    style: 'width: 12%;'
  },
  {
    name: 'saldo_a_favor',
    label: 'Saldo A Favor',
    align: 'right' as const,
    field: 'saldo_a_favor',
    sortable: true,
    style: 'width: 12%;'
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center' as const,
    field: 'actions',
    sortable: false,
    style: 'width: 8%;'
  }
];

// Columnas reactivas que se pueden reordenar
const columns = ref([...defaultColumns]);

const COLUMN_ORDER_KEY = 'instalaciones_column_order';

// Configuración de paginación en español
const paginationLabel = (firstRowIndex: number, endRowIndex: number, totalRowsNumber: number) => {
  return `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

// Función para resaltar texto
const highlightText = (text: string | number, filter: string): string => {
  if (!text || !filter) return String(text || '');

  const textStr = String(text);
  const filterStr = String(filter).toLowerCase();
  const index = textStr.toLowerCase().indexOf(filterStr);

  if (index === -1) return textStr;

  const before = textStr.substring(0, index);
  const match = textStr.substring(index, index + filter.length);
  const after = textStr.substring(index + filter.length);

  return `${before}<span style="color: red; font-weight: bold;">${match}</span>${after}`;
};

const loadInstalaciones = async () => {
  loading.value = true;
  try {
    const { data } = await apiClient.post('/instalaciones/list', {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      filters: {
        suscriptor: filters.value.suscriptor || undefined,
        sector_nombre: filters.value.sector_nombre || undefined,
        codigo: filters.value.codigo || undefined,
        nombre: filters.value.nombre || undefined,
        ident: filters.value.ident || undefined,
        direccion: filters.value.direccion || undefined,
        activo: filters.value.activo !== null ? filters.value.activo : undefined
      }
    });

    instalaciones.value = data.data || [];
    pagination.value.rowsNumber = data.total || 0;
  } catch (error: any) {
    console.error('Error al cargar instalaciones:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al cargar instalaciones',
      position: 'center'
    });
  } finally {
    loading.value = false;
  }
};

const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  await loadInstalaciones();
};

const applyFilters = () => {
  pagination.value.page = 1;
  loadInstalaciones();
};

// Funciones para manejar el orden de columnas
const loadColumnOrder = () => {
  try {
    const savedOrder = localStorage.getItem(COLUMN_ORDER_KEY);
    if (savedOrder) {
      const orderArray = JSON.parse(savedOrder) as string[];
      // Reordenar las columnas según el orden guardado
      const orderedColumns = orderArray
        .map(name => defaultColumns.find(col => col.name === name))
        .filter(col => col !== undefined);

      // Si todas las columnas están presentes, usar el orden guardado
      if (orderedColumns.length === defaultColumns.length) {
        columns.value = orderedColumns as typeof defaultColumns;
      }
    }
  } catch (error) {
    console.error('Error loading column order:', error);
  }
};

const saveColumnOrder = () => {
  try {
    const orderArray = columns.value.map(col => col.name);
    localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(orderArray));

    $q.notify({
      type: 'positive',
      message: 'Orden de columnas guardado',
      position: 'top',
      timeout: 1500
    });
  } catch (error) {
    console.error('Error saving column order:', error);
  }
};

const resetColumnOrder = () => {
  $q.dialog({
    title: 'Restablecer Orden',
    message: '¿Deseas restablecer el orden de las columnas al predeterminado?',
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey'
    },
    ok: {
      label: 'Restablecer',
      color: 'primary'
    }
  }).onOk(() => {
    columns.value = [...defaultColumns];
    localStorage.removeItem(COLUMN_ORDER_KEY);

    $q.notify({
      type: 'positive',
      message: 'Orden de columnas restablecido',
      position: 'top',
      timeout: 1500
    });
  });
};

const initializeSortable = () => {
  // Esperar a que el DOM esté completamente renderizado
  setTimeout(() => {
    const headerRow = document.querySelector('.sticky-header-table thead tr:first-child');

    if (headerRow) {
      console.log('Inicializando Sortable en header row');

      Sortable.create(headerRow as HTMLElement, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;

          console.log('Columna movida de', oldIndex, 'a', newIndex);

          if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
            // Reordenar el array de columnas
            const movedColumn = columns.value.splice(oldIndex, 1)[0];
            columns.value.splice(newIndex, 0, movedColumn);

            // Guardar el nuevo orden
            saveColumnOrder();
          }
        }
      });
    } else {
      console.error('No se encontró el header row para inicializar Sortable');
    }
  }, 500); // Delay de 500ms para asegurar que la tabla esté renderizada
};

// Exportación
const { exportToExcel, exportToPDF } = useExport();

const exportColumns: ExportColumn[] = [
  { field: 'suscriptor', label: 'Suscriptor' },
  { field: 'sector_nombre', label: 'Ruta' },
  { field: 'codigo', label: 'Código' },
  { field: 'nombre', label: 'Nombre' },
  { field: 'ident', label: 'Identificación' },
  { field: 'telefono', label: 'Teléfono' },
  { field: 'estrato_nombre', label: 'Estrato' },
  { field: 'direccion', label: 'Dirección' },
  { field: 'activo', label: 'Activo' },
  { field: 'n_centro_costos', label: 'Centro Costos' },
  { field: 'saldo_a_favor', label: 'Saldo A Favor' }
];

const handleExportExcel = () => {
  try {
    if (instalaciones.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'No hay datos para exportar',
        position: 'center'
      });
      return;
    }

    // Preparar datos con valores formateados
    const dataToExport = instalaciones.value.map(item => ({
      ...item,
      activo: item.activo ? 'Activo' : 'Inactivo',
      saldo_a_favor: item.saldo_a_favor || 0
    }));

    exportToExcel(dataToExport, exportColumns, 'instalaciones');

    $q.notify({
      type: 'positive',
      message: 'Exportación a Excel exitosa',
      position: 'center'
    });
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a Excel',
      position: 'center'
    });
  }
};

const handleExportPDF = () => {
  try {
    if (instalaciones.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'No hay datos para exportar',
        position: 'center'
      });
      return;
    }

    // Preparar datos con valores formateados
    const dataToExport = instalaciones.value.map(item => ({
      ...item,
      activo: item.activo ? 'Activo' : 'Inactivo',
      saldo_a_favor: formatCurrency(item.saldo_a_favor || 0)
    }));

    exportToPDF(dataToExport, exportColumns, 'instalaciones', 'Listado de Instalaciones');

    $q.notify({
      type: 'positive',
      message: 'Exportación a PDF exitosa',
      position: 'center'
    });
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a PDF',
      position: 'center'
    });
  }
};

const handleNew = () => {
  router.push('/instalaciones/new');
};

const handleEdit = (codigo: number) => {
  router.push(`/instalaciones/edit/${codigo}`);
};

onMounted(async () => {
  // Cargar el orden de columnas guardado
  loadColumnOrder();

  // Cargar datos
  await loadInstalaciones();

  // Inicializar drag & drop para columnas después de que los datos se hayan cargado
  initializeSortable();
});
</script>

<style scoped>
.full-width-page {
  padding: 16px;
}

.page-container {
  width: 100%;
  margin: 0;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.25);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: white;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 13px;
  margin: 2px 0 0 0;
  opacity: 0.9;
  color: white;
  line-height: 1.3;
}

.table-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-btn {
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: all 0.3s ease;
}

.new-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.export-btn {
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

:deep(.q-table) {
  box-shadow: none;
  width: 100%;
}

.sticky-header-table {
  width: 100%;
}

:deep(.q-table__container) {
  overflow-x: auto;
}

:deep(.q-table table) {
  width: 100%;
  table-layout: fixed;
}

:deep(.q-table__top) {
  padding: 0 0 16px 0;
}

:deep(.q-table thead tr) {
  background: #f8fafc;
}

:deep(.q-table thead th) {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: grab;
  user-select: none;
  position: relative;
}

:deep(.q-table thead th:hover) {
  background: #e5e7eb;
}

:deep(.q-table thead th:active) {
  cursor: grabbing;
}

:deep(.q-table tbody td) {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.q-table thead th) {
  white-space: nowrap;
}

:deep(.q-table tbody tr:hover) {
  background: #f8fafc;
}

/* Estilos para drag & drop de columnas */
:deep(.sortable-ghost) {
  opacity: 0.4;
  background: #e5e7eb !important;
}

:deep(.sortable-chosen) {
  background: #dbeafe !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.sortable-drag) {
  opacity: 1;
  background: white !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: grabbing !important;
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .table-card {
    padding: 16px;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed, onActivated } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useRouter } from 'vue-router';
import { salidasService } from '../services/api/salidas.service';
import { useAuthStore } from '../stores/auth';
import type { Salida } from '../types/salida';
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const { exportToExcel, exportToPDF } = useExport();
const loading = ref(false);
const filter = ref('');
const salidas = ref<Salida[]>([]);
const viewMode = ref<'table' | 'grid'>('table');

const columns: QTableColumn[] = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  {
    name: 'fechaFactura',
    label: 'Fecha',
    field: 'fechaFactura',
    align: 'left',
    sortable: true,
    format: (val: string) => val ? new Date(val).toLocaleDateString('es-CO', { timeZone: 'UTC' }) : '-'
  },
  { name: 'clienteNombre', label: 'Cliente', field: 'clienteNombre', align: 'left', sortable: true },
  {
    name: 'subtotal',
    label: 'Subtotal',
    field: 'subtotal',
    align: 'right',
    sortable: true,
    format: (val: number) => `$ ${val?.toLocaleString('es-CO') || '0'}`
  },
  {
    name: 'descuento',
    label: 'Descuento',
    field: 'descuento',
    align: 'right',
    sortable: true,
    format: (val: number) => `$ ${val?.toLocaleString('es-CO') || '0'}`
  },
  {
    name: 'iva',
    label: 'IVA',
    field: 'iva',
    align: 'right',
    sortable: true,
    format: (val: number) => `$ ${val?.toLocaleString('es-CO') || '0'}`
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'right',
    sortable: true,
    format: (val: number) => `$ ${val?.toLocaleString('es-CO') || '0'}`
  },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'left', sortable: true }
];

const visibleColumns = ref(['codigo', 'fechaFactura', 'clienteNombre', 'observacion', 'subtotal', 'descuento', 'iva', 'total']);
const columnFilters = ref<Record<string, string>>({});

const filteredData = computed(() => {
  return salidas.value.filter(row => {
    return Object.keys(columnFilters.value).every(key => {
      if (!columnFilters.value[key]) return true;
      const val = String(row[key as keyof Salida]).toLowerCase();
      return val.includes(columnFilters.value[key].toLowerCase());
    });
  });
});

const loadData = async () => {
  try {
    loading.value = true;
    const empresaId = authStore.user?.empresaId || 1;
    const data = await salidasService.getByEmpresa(empresaId);
    salidas.value = data || [];
  } catch (error) {
    console.error('Error al cargar salidas:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las salidas'
    });
    salidas.value = [];
  } finally {
    loading.value = false;
  }
};

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'fechaFactura', label: 'Fecha' },
      { field: 'clienteNombre', label: 'Cliente' },
      { field: 'observacion', label: 'Observación' },
      { field: 'subtotal', label: 'Subtotal' },
      { field: 'descuento', label: 'Descuento' },
      { field: 'iva', label: 'IVA' },
      { field: 'total', label: 'Total' }
    ];
    exportToExcel(filteredData.value, exportColumns, 'salidas');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'fechaFactura', label: 'Fecha' },
      { field: 'clienteNombre', label: 'Cliente' },
      { field: 'observacion', label: 'Observación' },
      { field: 'subtotal', label: 'Subtotal' },
      { field: 'descuento', label: 'Descuento' },
      { field: 'iva', label: 'IVA' },
      { field: 'total', label: 'Total' }
    ];
    exportToPDF(filteredData.value, exportColumns, 'salidas', 'Listado de Salidas');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value || 0);
};

const formatDate = (date: string | Date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-CO', { timeZone: 'UTC' });
};

const detailsLoading = ref<Record<string, boolean>>({});
const salidaDetails = ref<Record<string, any[]>>({});

const detailColumns: QTableColumn[] = [
  { name: 'codigo_item', label: 'Item', field: 'codigo_item', align: 'left' },
  { name: 'item_descripcion', label: 'Descripción', field: 'item_descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cant.', field: 'cantidad', align: 'right' },
  { name: 'valor_unitario', label: 'V. Unit.', field: 'valor_unitario', align: 'right' },
  { name: 'descuento', label: 'Desc %', field: 'descuento', align: 'right' },
  { name: 'iva', label: 'IVA %', field: 'iva', align: 'right' },
  { name: 'subtotal', label: 'Subtotal', field: 'subtotal', align: 'right' }
];

const toggleDetails = async (props: any) => {
  const row = props.row;
  props.expand = !props.expand;
  
  if (props.expand && !salidaDetails.value[row.codigo]) {
    try {
      detailsLoading.value[row.codigo] = true;
      const details = await salidasService.getDetalles(row.codigo);
      salidaDetails.value[row.codigo] = details;
    } catch (error) {
      console.error('Error loading details:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al cargar detalles'
      });
      // Close if error
      props.expand = false;
    } finally {
      detailsLoading.value[row.codigo] = false;
    }
  }
};

const handleUpdateObservacion = async (row: Salida, val: string) => {
  try {
    await salidasService.updateObservacion(row.codigo, val);
    $q.notify({
      type: 'positive',
      message: 'Observación actualizada',
      position: 'top-right'
    });
    // Update local state if needed (already updated by v-model but good to ensure sync)
    row.observacion = val; 
  } catch (error) {
    console.error('Error updating observacion:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar observación'
    });
  }
};

onMounted(() => {
  loadData();
});

onActivated(() => {
  loadData();
});
</script>

<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <div class="q-mr-md bg-white q-pa-sm rounded-borders shadow-1">
          <q-icon name="exit_to_app" color="primary" size="md" />
        </div>
        <div>
          <div class="text-h6 text-weight-bold text-grey-9">Salidas</div>
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <!-- Search Input -->
        <q-input
          outlined
          dense
          debounce="300"
          v-model="filter"
          placeholder="Buscar..."
          class="search-input bg-white"
          rounded
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-5" />
          </template>
        </q-input>

        <!-- View Toggle -->
        <q-btn-toggle
          v-model="viewMode"
          unelevated
          toggle-color="primary"
          :options="[
            { value: 'table', icon: 'view_list' },
            { value: 'grid', icon: 'grid_view' }
          ]"
          class="bg-white border-grey-3"
          style="border: 1px solid #e0e0e0; border-radius: 8px;"
        />

        <q-separator vertical class="q-mx-sm" />

        <q-btn
          outline
          color="positive"
          icon="description"
          @click="handleExportExcel"
          class="bg-white"
          round
        >
          <q-tooltip>Excel</q-tooltip>
        </q-btn>
        <q-btn
          outline
          color="negative"
          icon="picture_as_pdf"
          @click="handleExportPDF"
          class="bg-white"
          round
        >
          <q-tooltip>PDF</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          color="primary"
          icon="add"
          class="q-ml-sm"
          round
          @click="$router.push('/salidas/new')"
        >
          <q-tooltip>Nueva Salida</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Vista de Tabla -->
    <q-card v-if="viewMode === 'table'" class="shadow-1 rounded-borders bg-white">
      <q-table
        :rows="filteredData"
        :columns="columns"
        row-key="codigo"
        :loading="loading"
        :filter="filter"
        :visible-columns="visibleColumns"
        flat
        dense
        class="no-border"
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:top>
          <div class="row full-width items-center justify-end q-py-xs">
            <q-select
              v-model="visibleColumns"
              multiple
              outlined
              dense
              options-dense
              :display-value="$q.lang.table.columns"
              emit-value
              map-options
              :options="columns"
              option-value="name"
              options-cover
              style="min-width: 150px"
              bg-color="white"
              rounded
            />
          </div>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width />
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
          <q-tr :props="props">
            <q-th auto-width />
            <q-th v-for="col in props.cols" :key="col.name">
              <q-input
                v-model="columnFilters[col.name]"
                dense
                outlined
                class="bg-white"
                placeholder="Filtrar..."
                style="min-width: 60px"
              />
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn
                size="sm"
                color="primary"
                round
                dense
                @click="toggleDetails(props)"
                :icon="props.expand ? 'remove' : 'add'"
              />
            </q-td>
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.value }}
              <q-popup-edit
                v-if="col.name === 'observacion'"
                v-model="props.row.observacion"
                title="Editar Observación"
                buttons
                label-set="Guardar"
                label-cancel="Cancelar"
                @save="(val) => handleUpdateObservacion(props.row, val)"
                v-slot="scope"
              >
                <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
              </q-popup-edit>
            </q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%">
              <div class="q-pa-md">
                <div v-if="detailsLoading[props.row.codigo]" class="text-center">
                  <q-spinner color="primary" size="2em" />
                  <div class="q-mt-sm">Cargando detalles...</div>
                </div>
                <div v-else-if="salidaDetails[props.row.codigo]">
                  <q-table
                    :rows="salidaDetails[props.row.codigo]"
                    :columns="detailColumns"
                    row-key="id"
                    dense
                    flat
                    bordered
                    hide-bottom
                    class="bg-grey-1"
                  >
                     <template v-slot:body-cell-subtotal="detailProps">
                        <q-td :props="detailProps" class="text-right">
                           {{ formatCurrency(detailProps.row.subtotal) }}
                        </q-td>
                     </template>
                     <template v-slot:body-cell-valor_unitario="detailProps">
                        <q-td :props="detailProps" class="text-right">
                           {{ formatCurrency(detailProps.row.valor_unitario) }}
                        </q-td>
                     </template>
                  </q-table>
                </div>
                <div v-else class="text-grey-7 q-pa-sm">
                  No se pudieron cargar los detalles.
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-md q-py-xl">
            <q-icon name="exit_to_app" size="64px" color="grey-4" />
            <div class="text-center">
              <div class="text-h6 text-grey-6">No hay salidas registradas</div>
              <div class="text-caption text-grey-5">No se encontraron registros con los filtros aplicados</div>
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Vista de Tarjetas -->
    <div v-else class="grid-container">
      <q-inner-loading :showing="loading">
        <q-spinner-dots size="50px" color="primary" />
      </q-inner-loading>

      <div v-if="!loading && filteredData.length === 0" class="empty-state">
        <q-icon name="exit_to_app" size="96px" color="grey-4" />
        <h2 class="text-h5 text-grey-6 q-mt-md">No hay salidas registradas</h2>
        <p class="text-grey-5">Comienza agregando una nueva salida</p>
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Agregar Salida"
          @click="$router.push('/salidas/new')"
          class="q-mt-md"
        />
      </div>

      <div v-else class="cards-grid">
        <q-card
          v-for="salida in filteredData"
          :key="salida.codigo"
          class="salida-card"
          flat
          bordered
        >
          <q-card-section class="card-header">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <q-avatar color="primary" text-color="white" size="48px">
                  <q-icon name="exit_to_app" size="28px" />
                </q-avatar>
                <div class="q-ml-md">
                  <div class="card-title">Salida #{{ salida.codigo }}</div>
                  <div class="card-code">{{ formatDate(salida.fechahora) }}</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="card-body">
            <div class="info-row">
              <q-icon name="person" size="20px" color="grey-7" />
              <div class="info-content">
                <div class="info-label">Cliente</div>
                <div class="info-value">{{ salida.clienteNombre || 'N/A' }}</div>
              </div>
            </div>

            <div class="info-row">
              <q-icon name="receipt" size="20px" color="grey-7" />
              <div class="info-content">
                <div class="info-label">Subtotal</div>
                <div class="info-value">{{ formatCurrency(salida.subtotal) }}</div>
              </div>
            </div>

            <div class="info-row">
              <q-icon name="discount" size="20px" color="grey-7" />
              <div class="info-content">
                <div class="info-label">Descuento</div>
                <div class="info-value text-negative">{{ formatCurrency(salida.descuento) }}</div>
              </div>
            </div>

            <div class="info-row">
              <q-icon name="paid" size="20px" color="grey-7" />
              <div class="info-content">
                <div class="info-label">IVA</div>
                <div class="info-value">{{ formatCurrency(salida.iva) }}</div>
              </div>
            </div>

            <div class="info-row">
              <q-icon name="attach_money" size="20px" color="grey-7" />
              <div class="info-content">
                <div class="info-label">Total</div>
                <div class="info-value text-weight-bold text-primary">{{ formatCurrency(salida.total) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.rounded-xl { border-radius: 20px; }
.rounded-borders { border-radius: 12px; }
.search-input { min-width: 200px; }
:deep(.q-table__card) { box-shadow: none; }
:deep(.q-table th) { font-size: 0.75rem; letter-spacing: 0.05em; font-weight: bold; color: #616161; }

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

.grid-container {
  position: relative;
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.salida-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
    border-color: #cbd5e0;
  }
}

.card-header {
  padding: 20px;
  background: white;
  border-bottom: 3px solid #f7fafc;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.card-code {
  font-size: 13px;
  color: #718096;
  font-weight: 600;
}

.card-body {
  padding: 20px;
  background: #fafafa;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #2d3748;
  font-weight: 600;
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>

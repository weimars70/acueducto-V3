<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { movimientosInventarioService } from '../services/api/movimientos-inventario.service';
import { useAuthStore } from '../stores/auth';
import type { MovimientoInventario } from '../types/movimiento-inventario';
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const authStore = useAuthStore();
const { exportToExcel, exportToPDF } = useExport();
const loading = ref(false);
const filter = ref('');
const movimientos = ref<MovimientoInventario[]>([]);

const columns: QTableColumn[] = [
  { name: 'id_movimiento', label: 'ID', field: 'id_movimiento', sortable: true, align: 'left' },
  { name: 'fecha_movimiento', label: 'Fecha Movimiento', field: 'fecha_movimiento', sortable: true, align: 'left', format: (val: string) => new Date(val).toLocaleDateString() },
  { name: 'nombre', label: 'Item', field: 'nombre', sortable: true, align: 'left' },
  { name: 'n_tipo_movimiento', label: 'Tipo Movimiento', field: 'n_tipo_movimiento', sortable: true, align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', sortable: true, align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', sortable: true, align: 'center' },
  { name: 'observaciones', label: 'Observaciones', field: 'observaciones', align: 'left' },
];

const visibleColumns = ref([ 'fecha_movimiento', 'nombre', 'n_tipo_movimiento', 'cantidad', 'estado' ]);
const columnFilters = ref<Record<string, string>>({});

const filteredMovimientos = computed(() => {
  return movimientos.value.filter(row => {
    return Object.keys(columnFilters.value).every(key => {
      if (!columnFilters.value[key]) return true;
      const val = String(row[key as keyof MovimientoInventario]).toLowerCase();
      return val.includes(columnFilters.value[key].toLowerCase());
    });
  });
});

const loadMovimientos = async () => {
  try {
    loading.value = true;
    const empresaId = authStore.user?.empresaId || 0;
    movimientos.value = await movimientosInventarioService.getAll(empresaId);
  } catch (error) {
    console.error('Error loading movimientos:', error);
    $q.notify({ type: 'negative', message: 'Error cargando el listado de movimientos' });
  } finally {
    loading.value = false;
  }
};

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'id_movimiento', label: 'ID' },
      { field: 'fecha_movimiento', label: 'Fecha' },
      { field: 'nombre', label: 'Item' },
      { field: 'n_tipo_movimiento', label: 'Tipo Movimiento' },
      { field: 'cantidad', label: 'Cantidad' },
      { field: 'estado', label: 'Estado' }
    ];
    exportToExcel(filteredMovimientos.value, exportColumns, 'movimientos_inventario');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'id_movimiento', label: 'ID' },
      { field: 'fecha_movimiento', label: 'Fecha' },
      { field: 'nombre', label: 'Item' },
      { field: 'n_tipo_movimiento', label: 'Tipo Movimiento' },
      { field: 'cantidad', label: 'Cantidad' },
      { field: 'estado', label: 'Estado' }
    ];
    exportToPDF(filteredMovimientos.value, exportColumns, 'movimientos_inventario', 'Listado de Movimientos de Inventario');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

onMounted(() => {
  loadMovimientos();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <div class="q-mr-md bg-white q-pa-sm rounded-borders shadow-1">
          <q-icon name="inventory_2" color="primary" size="md" />
        </div>
        <div>
          <div class="text-h5 text-weight-bold text-grey-9">Movimientos de Inventario</div>
          <div class="text-caption text-grey-7">Listado completo de movimientos</div>
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          outline
          color="positive"
          icon="description"
          label="Excel"
          @click="handleExportExcel"
          no-caps
          class="export-btn"
        >
          <q-tooltip>Exportar a Excel</q-tooltip>
        </q-btn>
        <q-btn
          outline
          color="negative"
          icon="picture_as_pdf"
          label="PDF"
          @click="handleExportPDF"
          no-caps
          class="export-btn"
        >
          <q-tooltip>Exportar a PDF</q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-card class="shadow-2 rounded-xl bg-white">
      <q-table
        :rows="filteredMovimientos"
        :columns="columns"
        row-key="id_movimiento"
        :loading="loading"
        :filter="filter"
        :visible-columns="visibleColumns"
        flat
        class="no-border"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:top>
           <div class="row full-width items-center q-py-sm q-col-gutter-md">
              <div class="col-12 col-sm-auto text-h6 text-weight-medium text-primary">Detalle</div>
              <q-space />
              
              <div class="col-12 col-sm-auto">
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

              <div class="col-12 col-sm-auto">
                <q-input 
                  outlined 
                  dense 
                  debounce="300" 
                  v-model="filter" 
                  placeholder="Buscar..."
                  class="search-input bg-grey-1"
                  rounded
                >
                  <template v-slot:prepend>
                    <q-icon name="search" color="grey-5" />
                  </template>
                </q-input>
              </div>
           </div>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
          <q-tr :props="props">
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
        
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'Confirmado' ? 'positive' : 'warning'" :label="props.value" />
          </q-td>
        </template>
      </q-table>
    </q-card>
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
</style>

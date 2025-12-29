<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { diferidosService } from '../services/api/diferidos.service';
import type { CuotaConexion } from '../types/cuotas-conexion';
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const { exportToExcel, exportToPDF } = useExport();

const cuotas = ref<CuotaConexion[]>([]);
const loading = ref(false);
const filter = ref('');

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left' as const },
  { name: 'instalacion_codigo', label: 'Instalación', field: 'instalacion_codigo', sortable: true, align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' as const },
  { name: 'fecha', label: 'Fecha', field: 'fecha', sortable: true, align: 'center' as const, format: (val: string) => val ? new Date(val).toLocaleDateString() : '' },
  { name: 'saldo', label: 'Saldo', field: 'saldo', sortable: true, align: 'right' as const, format: (val: number) => `$ ${val ? val.toLocaleString() : '0'}` },
  { name: 'cuota', label: 'Cuota', field: 'cuota', sortable: true, align: 'right' as const, format: (val: number) => `$ ${val ? val.toLocaleString() : '0'}` },
  { name: 'por_interes', label: '% Interés', field: 'por_interes', sortable: true, align: 'center' as const, format: (val: number) => `${val}%` }
];

const filteredData = () => {
  if (!filter.value) return cuotas.value;
  const search = filter.value.toLowerCase();
  return cuotas.value.filter(item => 
    item.nombre.toLowerCase().includes(search) ||
    item.instalacion_codigo.toString().includes(search) ||
    item.codigo.toString().includes(search)
  );
};

const handleExportExcel = () => {
  try {
    const exportColumns = columns.map(col => ({
      field: typeof col.field === 'function' ? col.name : (col.field as string),
      label: col.label,
      align: col.align
    }));
    const dataToExport = filteredData().map(row => ({
      ...row,
      fecha: row.fecha ? new Date(row.fecha).toISOString().substring(0, 10) : '',
      saldo: row.saldo ? row.saldo.toLocaleString() : '0',
      cuota: row.cuota ? row.cuota.toLocaleString() : '0'
    }));
    exportToExcel(dataToExport, exportColumns, 'cuotas-medidor');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = columns.map(col => ({
      field: typeof col.field === 'function' ? col.name : (col.field as string),
      label: col.label,
      align: col.align
    }));
    const dataToExport = filteredData().map(row => ({
      ...row,
      fecha: row.fecha ? new Date(row.fecha).toISOString().substring(0, 10) : '',
      saldo: row.saldo ? row.saldo.toLocaleString() : '0',
      cuota: row.cuota ? row.cuota.toLocaleString() : '0'
    }));
    exportToPDF(dataToExport, exportColumns, 'cuotas-medidor', 'Listado de Cuotas de Medidor');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

const loadCuotas = async () => {
  try {
    loading.value = true;
    cuotas.value = await diferidosService.getCuotasMedidor();
  } catch (error) {
    console.error('Error loading cuotas medidor:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar listado de cuotas medidor'
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCuotas();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <div class="q-mr-md bg-white q-pa-sm rounded-borders shadow-1">
            <q-icon name="speed" color="primary" size="md" />
        </div>
        <div>
          <div class="text-h5 text-weight-bold text-grey-9">Cuotas Medidor</div>
          <div class="text-caption text-grey-7">Listado de cuotas diferidas de medidores</div>
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
        :rows="filteredData()"
        :columns="columns"
        row-key="codigo"
        :loading="loading"
        flat
        class="no-border"
        content-class="text-grey-8"
        table-header-class="text-weight-bold text-grey-7 bg-grey-1 text-uppercase"
      >
        <template v-slot:top>
           <div class="row full-width items-center q-py-sm">
              <div class="text-h6 text-weight-medium text-primary">Detalle de Cuotas</div>
              <q-space />
              <q-input 
                outlined 
                dense 
                debounce="300" 
                v-model="filter" 
                placeholder="Buscar por nombre, instalación..."
                class="search-input bg-grey-1"
                rounded
              >
                <template v-slot:prepend>
                   <q-icon name="search" color="grey-5" />
                </template>
              </q-input>
           </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<style scoped>
.rounded-xl {
  border-radius: 20px;
}
.rounded-borders {
    border-radius: 12px;
}
.search-input {
  width: 280px;
}
:deep(.q-table__card) {
    box-shadow: none;
}
:deep(.q-table th) {
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}
</style>

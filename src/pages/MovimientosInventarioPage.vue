<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { movimientosInventarioService } from '../services/api/movimientos-inventario.service';
import { useAuthStore } from '../stores/auth';
import type { MovimientoInventario } from '../types/movimiento-inventario';

const $q = useQuasar();
const authStore = useAuthStore();
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
    </div>

    <q-card class="shadow-2 rounded-xl bg-white">
      <q-table
        :rows="movimientos"
        :columns="columns"
        row-key="id_movimiento"
        :loading="loading"
        :filter="filter"
        flat
        class="no-border"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:top>
           <div class="row full-width items-center q-py-sm">
              <div class="text-h6 text-weight-medium text-primary">Detalle</div>
              <q-space />
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
.search-input { width: 280px; }
:deep(.q-table__card) { box-shadow: none; }
:deep(.q-table th) { font-size: 0.75rem; letter-spacing: 0.05em; font-weight: bold; color: #616161; }
</style>

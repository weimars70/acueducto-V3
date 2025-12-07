<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { estratosTarifasService } from '../services/api/estratos-tarifas.service';
import { estratosService } from '../services/api/estratos.service';
import { estratosTipoService } from '../services/api/estratos-tipo.service';
import type { EstratoTarifa } from '../types/estrato-tarifa';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const items = ref<EstratoTarifa[]>([]);
const estratosMap = ref<Record<number, string>>({});
const tiposMap = ref<Record<number, string>>({});
const loading = ref(false);
const filter = ref('');

const columns = [
  { name: 'estrato', label: 'Estrato', field: 'codigo', format: (val: number) => estratosMap.value[val] || val, sortable: true, align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', format: (val: number) => tiposMap.value[val] || val, sortable: true, align: 'left' },
  { name: 'cargo', label: 'Cargo Fijo', field: 'cargo', format: (val: number) => `$ ${Number(val).toLocaleString()}`, sortable: true, align: 'right' },
  { name: 'basico', label: 'Básico', field: 'basico', align: 'right' },
  { name: 'complementario', label: 'Complementario', field: 'complementario', align: 'right' },
  { name: 'suntuario', label: 'Suntuario', field: 'suntuario', align: 'right' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
];

const loadData = async () => {
  try {
    loading.value = true;
    const empresaId = authStore.user?.empresaId;
    
    // Load catalogs first to map IDs to names
    const [kEstratos, kTipos, kTarifas] = await Promise.all([
        estratosService.getAll(empresaId),
        estratosTipoService.getAll(empresaId),
        estratosTarifasService.getAll(empresaId)
    ]);

    // Create maps
    kEstratos.forEach(e => estratosMap.value[e.codigo] = e.nombre);
    kTipos.forEach(t => tiposMap.value[t.codigo] = t.nombre);

    items.value = kTarifas;
  } catch (error) {
    console.error('Error loading tarifas:', error);
    $q.notify({ type: 'negative', message: 'Error cargando datos' });
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row: EstratoTarifa) => {
  router.push(`/estratos-tarifas/editar/${row.codigo}/${row.tipo}`);
};

const handleDelete = (row: EstratoTarifa) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de eliminar esta tarifa?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative' }
  }).onOk(async () => {
    try {
      await estratosTarifasService.delete(row.codigo, row.tipo);
      $q.notify({ type: 'positive', message: 'Tarifa eliminada exitosamente' });
      loadData();
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar la tarifa' });
    }
  });
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <div class="q-mr-md bg-white q-pa-sm rounded-borders shadow-1">
            <q-icon name="attach_money" color="primary" size="md" />
        </div>
        <div>
          <div class="text-h5 text-weight-bold text-grey-9">Tarifas por Estrato</div>
          <div class="text-caption text-grey-7">Configuración de precios y subsidios</div>
        </div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nueva Tarifa"
        to="/estratos-tarifas/nuevo"
        unelevated
        class="q-px-lg q-py-xs shadow-2"
        rounded
        no-caps
      />
    </div>

    <q-card class="shadow-2 rounded-xl bg-white">
      <q-table
        :rows="items"
        :columns="columns"
        row-key="id" 
        :loading="loading"
        :filter="filter"
        flat
        class="no-border"
        content-class="text-grey-8"
        table-header-class="text-weight-bold text-grey-7 bg-grey-1 text-uppercase"
      >
        <template v-slot:top>
           <div class="row full-width items-center q-py-sm">
              <div class="text-h6 text-weight-medium text-primary">Listado</div>
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

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row justify-end">
                <q-btn flat round color="grey-7" icon="edit" size="md" @click="handleEdit(props.row)" class="hover-scale">
                  <q-tooltip class="bg-primary">Editar</q-tooltip>
                </q-btn>
                <q-btn flat round color="negative" icon="delete_outline" size="md" @click="handleDelete(props.row)" class="hover-scale">
                  <q-tooltip class="bg-negative">Eliminar</q-tooltip>
                </q-btn>
            </div>
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
.hover-scale { transition: transform 0.2s; }
.hover-scale:hover { transform: scale(1.1); }
:deep(.q-table__card) { box-shadow: none; }
:deep(.q-table th) { font-size: 0.75rem; letter-spacing: 0.05em; }
</style>

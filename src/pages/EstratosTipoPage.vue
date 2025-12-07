<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { estratosTipoService } from '../services/api/estratos-tipo.service';
import type { EstratoTipo } from '../types/estrato-tipo';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const items = ref<EstratoTipo[]>([]);
const loading = ref(false);
const filter = ref('');

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left' },
  { name: 'nombre', label: 'Descripción del Tipo', field: 'nombre', sortable: true, align: 'left' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
];

const loadItems = async () => {
  try {
    loading.value = true;
    const empresaId = authStore.user?.empresaId;
    items.value = await estratosTipoService.getAll(empresaId);
  } catch (error) {
    console.error('Error loading estratos tipo:', error);
    $q.notify({ type: 'negative', message: 'Error cargando datos' });
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row: EstratoTipo) => {
  router.push(`/estratos-tipo/editar/${row.codigo}`);
};

const handleDelete = (row: EstratoTipo) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de eliminar el tipo "${row.nombre}"?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative' }
  }).onOk(async () => {
    try {
      await estratosTipoService.delete(row.codigo);
      $q.notify({ type: 'positive', message: 'Tipo eliminado exitosamente' });
      loadItems();
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar el tipo' });
    }
  });
};

onMounted(() => {
  loadItems();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <div class="q-mr-md bg-white q-pa-sm rounded-borders shadow-1">
            <q-icon name="category" color="primary" size="md" />
        </div>
        <div>
          <div class="text-h5 text-weight-bold text-grey-9">Tipos de Estrato</div>
          <div class="text-caption text-grey-7">Clasificación de estratos</div>
        </div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Tipo"
        to="/estratos-tipo/nuevo"
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
        row-key="codigo"
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

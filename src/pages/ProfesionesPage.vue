<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, type QTableColumn } from 'quasar';
import { profesionesService } from '../services/api/profesiones.service';
import type { Profesion } from '../types/profesion';

const $q = useQuasar();
const router = useRouter();

const profesiones = ref<Profesion[]>([]);
const loading = ref(false);
const filter = ref('');
const columnFilters = ref<Record<string, string>>({});

const filteredProfesiones = computed(() => {
  return profesiones.value.filter(row => {
    return Object.keys(columnFilters.value).every(key => {
      if (!columnFilters.value[key]) return true;
      const val = String(row[key as keyof Profesion] || '').toLowerCase();
      return val.includes(columnFilters.value[key].toLowerCase());
    });
  });
});

const columns: QTableColumn[] = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' },
  { name: 'usuario', label: 'Usuario', field: 'usuario', sortable: true, align: 'left' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
];

const loadProfesiones = async () => {
  try {
    loading.value = true;
    profesiones.value = await profesionesService.getAll();
  } catch (error) {
    console.error('Error loading profesiones:', error);
    $q.notify({ type: 'negative', message: 'Error cargando datos' });
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row: Profesion) => {
  router.push(`/profesiones/edit/${row.codigo}`);
};

const handleDelete = (row: Profesion) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de eliminar la profesión "${row.nombre}"?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative' }
  }).onOk(async () => {
    try {
      await profesionesService.delete(row.codigo);
      $q.notify({ type: 'positive', message: 'Profesión eliminada exitosamente' });
      loadProfesiones();
    } catch (error) {
       console.error(error);
      $q.notify({ type: 'negative', message: 'Error al eliminar la profesión' });
    }
  });
};

onMounted(() => {
  loadProfesiones();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <div class="q-mr-md bg-white q-pa-sm rounded-borders shadow-1">
            <q-icon name="work" color="primary" size="md" />
        </div>
        <div>
          <div class="text-h5 text-weight-bold text-grey-9">Profesiones</div>
          <div class="text-caption text-grey-7">Gestión de profesiones</div>
        </div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nueva Profesión"
        to="/profesiones/new"
        unelevated
        class="q-px-lg q-py-xs shadow-2"
        rounded
        no-caps
      />
    </div>

    <q-card class="shadow-2 rounded-xl bg-white">
      <q-table
        :rows="filteredProfesiones"
        :columns="columns"
        row-key="codigo"
        :loading="loading"
        :filter="filter"
        flat
        class="no-border"
        content-class="text-grey-8"
        table-header-class="text-weight-bold text-grey-7 bg-grey-1 text-uppercase"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name">
              <q-input
                v-if="col.name !== 'actions'"
                v-model="columnFilters[col.field]"
                dense
                outlined
                class="bg-white"
                placeholder="Filtrar..."
                style="min-width: 60px"
              />
            </q-th>
          </q-tr>
        </template>
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

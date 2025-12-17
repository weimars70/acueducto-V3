<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { notaConceptoService } from '../services/api/nota-concepto.service';
import type { NotaConcepto } from '../types/nota-concepto';

const $q = useQuasar();
const router = useRouter();

const conceptos = ref<NotaConcepto[]>([]);
const loading = ref(false);
const filter = ref('');

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left', style: 'width: 80px', headerStyle: 'font-weight: bold' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', sortable: true, align: 'left', headerStyle: 'font-weight: bold' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right', headerStyle: 'font-weight: bold' }
];

const loadConceptos = async () => {
  try {
    loading.value = true;
    conceptos.value = await notaConceptoService.getAll();
  } catch (error) {
    console.error('Error loading conceptos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar conceptos de notas'
    });
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row: NotaConcepto) => {
  router.push(`/notas-conceptos/editar/${row.codigo}`);
};

const handleDelete = (row: NotaConcepto) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar el concepto "${row.descripcion}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await notaConceptoService.delete(row.codigo);
      $q.notify({
        type: 'positive',
        message: 'Concepto eliminado exitosamente'
      });
      loadConceptos();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el concepto'
      });
    }
  });
};

onMounted(() => {
  loadConceptos();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="primary" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold text-primary">Conceptos de Notas</div>
          <div class="text-caption text-grey-7">Gestione los conceptos disponibles para sus notas</div>
        </div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Concepto"
        to="/notas-conceptos/nuevo"
        unelevated
        class="q-px-md shadow-2"
        rounded
      />
    </div>

    <q-card class="shadow-2 rounded-borders">
      <q-table
        :rows="conceptos"
        :columns="columns"
        row-key="codigo"
        :loading="loading"
        :filter="filter"
        flat
        bordered
        separator="horizontal"
      >
        <template v-slot:top>
          <div class="text-subtitle1 text-weight-medium text-grey-8">Listado de Conceptos</div>
          <q-space />
          <q-input
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="Buscar concepto..."
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props" class="bg-grey-2 text-grey-9">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row justify-end q-gutter-sm">
                <q-btn flat round color="grey-7" icon="edit" size="sm" @click="handleEdit(props.row)">
                <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn flat round color="negative" icon="delete_outline" size="sm" @click="handleDelete(props.row)">
                <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.search-input {
  width: 300px;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { bancoService } from '../services/api/banco.service';
import type { Banco } from '../types/banco';

const $q = useQuasar();
const router = useRouter();
const bancos = ref<Banco[]>([]);
const loading = ref(true);
const filter = ref('');
const pagination = ref({
  sortBy: 'codigo',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'numero_cuenta', label: 'Número de Cuenta', field: 'numero_cuenta', align: 'left' as const, sortable: true },
  { name: 'titular', label: 'Titular', field: 'titular', align: 'left' as const, sortable: true },
  { name: 'entidad_financiera', label: 'Entidad Financiera', field: 'entidad_financiera', align: 'left' as const, sortable: true },
  { name: 'moneda', label: 'Moneda', field: 'moneda', align: 'center' as const, sortable: true },
  { name: 'activa', label: 'Estado', field: 'activa', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const loadData = async () => {
  try {
    loading.value = true;
    const response = await bancoService.getBancos({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      nombre: filter.value || undefined
    });

    if (response && response.data) {
      bancos.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      bancos.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar bancos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los bancos'
    });
    bancos.value = [];
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
  router.push('/bancos/new');
};

const handleEdit = (banco: Banco) => {
  router.push(`/bancos/edit/${banco.id}`);
};

const handleDelete = async (banco: Banco) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el banco ${banco.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await bancoService.delete(banco.id);
      $q.notify({
        type: 'positive',
        message: 'Banco eliminado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar banco:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el banco'
      });
    }
  });
};

const handleSearch = () => {
  pagination.value.page = 1;
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row q-mb-md items-center justify-between">
        <div class="text-h5">Bancos</div>
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Banco"
          @click="handleNew"
        />
      </div>

      <!-- Filtros -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="filter"
                label="Buscar por nombre"
                dense
                outlined
                clearable
                @keyup.enter="handleSearch"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    icon="search"
                    @click="handleSearch"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-table
        :rows="bancos"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        @request="onRequest"
        binary-state-sort
        :rows-per-page-options="[10, 20, 50, 100]"
      >
        <template v-slot:body-cell-activa="props">
          <q-td :props="props">
            <q-badge :color="props.row.activa ? 'positive' : 'negative'">
              {{ props.row.activa ? 'Activa' : 'Inactiva' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click="handleEdit(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              @click="handleDelete(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="warning" />
            <span>No hay bancos registrados</span>
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<style scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>

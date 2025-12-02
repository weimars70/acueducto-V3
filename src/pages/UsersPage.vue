<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { userService } from '../services/api/user.service';
import type { User } from '../types/user';

const $q = useQuasar();
const router = useRouter();
const users = ref<User[]>([]);
const loading = ref(true);
const filter = ref('');
const pagination = ref({
  sortBy: 'user_id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  { name: 'user_id', label: 'ID', field: 'user_id', align: 'left' as const, sortable: true },
  { name: 'user_name', label: 'Nombre', field: 'user_name', align: 'left' as const, sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const, sortable: true },
  { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' as const, sortable: true },
  { name: 'role_nombre', label: 'Rol', field: 'role_nombre', align: 'left' as const, sortable: true },
  { name: 'active', label: 'Estado', field: 'active', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const loadData = async () => {
  try {
    loading.value = true;
    const response = await userService.getUsers({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      user_name: filter.value || undefined
    });

    if (response && response.data) {
      users.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      users.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los usuarios'
    });
    users.value = [];
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
  router.push('/users/new');
};

const handleEdit = (user: User) => {
  router.push(`/users/edit/${user.user_id}`);
};

const handleDelete = async (user: User) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el usuario ${user.user_name}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await userService.delete(user.user_id);
      $q.notify({
        type: 'positive',
        message: 'Usuario eliminado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el usuario'
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
        <div class="text-h5">Usuarios</div>
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Usuario"
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
        :rows="users"
        :columns="columns"
        row-key="user_id"
        :loading="loading"
        v-model:pagination="pagination"
        @request="onRequest"
        binary-state-sort
        :rows-per-page-options="[10, 20, 50, 100]"
      >
        <template v-slot:body-cell-active="props">
          <q-td :props="props">
            <q-badge :color="props.row.active ? 'positive' : 'negative'">
              {{ props.row.active ? 'Activo' : 'Inactivo' }}
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
            <span>No hay usuarios registrados</span>
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

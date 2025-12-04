<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { clienteService } from '../services/api/cliente.service';
import { useAuthStore } from '../stores/auth';
import type { Cliente } from '../types/cliente';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const clientes = ref<Cliente[]>([]);
const loading = ref(true);
const filter = ref('');

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'identificacion', label: 'Identificación', field: 'identificacion', align: 'left' as const, sortable: true },
  { name: 'nombres', label: 'Nombres', field: 'nombres', align: 'left' as const, sortable: true },
  { name: 'apellido1', label: 'Primer Apellido', field: 'apellido1', align: 'left' as const, sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' as const, sortable: false },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const loadData = async () => {
  try {
    loading.value = true;
    const empresaId = authStore.user?.empresaId || 1;
    const data = await clienteService.getByEmpresa(empresaId);
    clientes.value = data || [];
  } catch (error) {
    console.error('Error al cargar clientes:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los clientes'
    });
    clientes.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredData = () => {
  if (!filter.value) return clientes.value;
  return clientes.value.filter(item =>
    item.nombres.toLowerCase().includes(filter.value.toLowerCase()) ||
    item.apellido1.toLowerCase().includes(filter.value.toLowerCase()) ||
    item.identificacion.toString().includes(filter.value)
  );
};

const handleNew = () => {
  router.push('/clientes/new');
};

const handleEdit = (cliente: Cliente) => {
  router.push(`/clientes/edit/${cliente.codigo}`);
};

const handleDelete = async (cliente: Cliente) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el cliente ${cliente.nombres} ${cliente.apellido1}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await clienteService.delete(cliente.codigo);
      $q.notify({
        type: 'positive',
        message: 'Cliente eliminado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el cliente'
      });
    }
  });
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page class="page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="people_alt" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Clientes</h1>
              <p class="page-subtitle">Gestión de clientes</p>
            </div>
          </div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Nuevo Cliente"
            class="action-btn"
            @click="handleNew"
          />
        </div>
      </div>

      <!-- Filtros -->
      <q-card flat class="filter-card">
        <q-card-section class="filter-section">
          <q-input
            v-model="filter"
            placeholder="Buscar cliente..."
            outlined
            dense
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-icon
                v-if="filter"
                name="close"
                class="cursor-pointer"
                @click="filter = ''"
              />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-card flat class="content-card">
        <q-table
          :rows="filteredData()"
          :columns="columns"
          row-key="codigo"
          :loading="loading"
          flat
          :rows-per-page-options="[10, 25, 50, 0]"
          class="modern-table"
        >
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <span class="text-weight-bold text-primary">{{ props.row.codigo }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-identificacion="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon name="badge" size="20px" color="grey-6" class="q-mr-sm" />
                <span class="text-weight-medium">{{ props.row.identificacion }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.activo ? 'positive' : 'negative'"
                text-color="white"
                dense
                size="sm"
              >
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  size="sm"
                  @click="handleEdit(props.row)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="handleDelete(props.row)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-md q-py-xl">
              <q-icon name="people_alt" size="64px" color="grey-4" />
              <div class="text-center">
                <div class="text-h6 text-grey-6">No hay clientes registrados</div>
                <div class="text-caption text-grey-5">Comienza agregando un nuevo cliente</div>
              </div>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.title-section {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
}

.action-btn {
  height: 38px;
  padding: 0 20px;
  font-weight: 500;
  font-size: 13px;
  border-radius: 8px;
}

.filter-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filter-section {
  padding: 20px;
}

.search-input {
  max-width: 500px;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modern-table {
  :deep(.q-table__top),
  :deep(.q-table__bottom),
  :deep(thead tr:first-child th) {
    background-color: #f8f9fa;
  }

  :deep(thead tr th) {
    font-weight: 600;
    color: #2d3748;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  :deep(tbody tr:hover) {
    background-color: #f7fafc;
  }

  :deep(tbody td) {
    font-size: 14px;
  }
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-btn {
    width: 100%;
  }

  .search-input {
    max-width: 100%;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { terceroService } from '../services/api/tercero.service';
import type { Tercero } from '../types/tercero';

const $q = useQuasar();
const router = useRouter();
const terceros = ref<any[]>([]);
const loading = ref(true);
const filter = ref('');
const pagination = ref({
  sortBy: 'codigo',
  descending: false,
  page: 1,
  rowsPerPage: 12,
  rowsNumber: 0
});

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'identificacion', label: 'Identificación', field: 'identificacion', align: 'left' as const, sortable: true },
  { name: 'ciudad_nombre', label: 'Ciudad', field: 'ciudad_nombre', align: 'left' as const, sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' as const, sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const, sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'center' as const, sortable: true },
  { name: 'proveedor', label: 'Proveedor', field: 'proveedor', align: 'center' as const, sortable: true },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const loadData = async () => {
  try {
    loading.value = true;
    const response = await terceroService.getAll({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      nombre: filter.value || undefined
    });

    if (response && response.data) {
      terceros.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      terceros.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar terceros:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los terceros'
    });
    terceros.value = [];
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
  router.push('/terceros/new');
};

const handleEdit = (tercero: any) => {
  router.push(`/terceros/edit/${tercero.codigo}`);
};

const handleDelete = async (tercero: any) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el tercero ${tercero.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await terceroService.delete(tercero.codigo);
      $q.notify({
        type: 'positive',
        message: 'Tercero eliminado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar tercero:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el tercero'
      });
    }
  });
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page class="page-container">
    <div class="page-content">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <q-icon name="people" size="42px" color="primary" class="header-icon" />
          <div class="header-text">
            <h1 class="page-title">Terceros</h1>
            <p class="page-subtitle">Gestión de clientes y proveedores</p>
          </div>
        </div>
        <q-btn
          unelevated
          color="primary"
          label="Nuevo Tercero"
          icon="add"
          @click="handleNew"
          class="new-btn"
        />
      </div>

      <!-- Filters Card -->
      <q-card flat class="filters-card">
        <q-card-section class="filters-section">
          <div class="filters-row">
            <q-input
              v-model="filter"
              placeholder="Buscar por nombre..."
              outlined
              dense
              clearable
              @keyup.enter="loadData"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="grey-6" />
              </template>
            </q-input>
            <q-btn
              unelevated
              color="primary"
              label="Buscar"
              icon="search"
              @click="loadData"
              class="search-btn"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Table Card -->
      <q-card flat class="table-card">
        <q-table
          :rows="terceros"
          :columns="columns"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          row-key="codigo"
          flat
          :rows-per-page-options="[12, 24, 48]"
          class="modern-table"
        >
          <!-- Cliente Badge -->
          <template v-slot:body-cell-cliente="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.cliente ? 'primary' : 'grey-4'"
                :label="props.row.cliente ? 'SÍ' : 'NO'"
                :text-color="props.row.cliente ? 'white' : 'grey-7'"
                class="status-badge"
              />
            </q-td>
          </template>

          <!-- Proveedor Badge -->
          <template v-slot:body-cell-proveedor="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.proveedor ? 'secondary' : 'grey-4'"
                :label="props.row.proveedor ? 'SÍ' : 'NO'"
                :text-color="props.row.proveedor ? 'white' : 'grey-7'"
                class="status-badge"
              />
            </q-td>
          </template>

          <!-- Estado Badge -->
          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.activo ? 'positive' : 'negative'"
                :label="props.row.activo ? 'Activo' : 'Inactivo'"
                class="status-badge"
              />
            </q-td>
          </template>

          <!-- Actions -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  @click="handleEdit(props.row)"
                  size="sm"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="handleDelete(props.row)"
                  size="sm"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- Loading -->
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <!-- No Data -->
          <template v-slot:no-data>
            <div class="no-data">
              <q-icon name="people_outline" size="64px" color="grey-5" />
              <p class="no-data-text">No hay terceros registrados</p>
              <q-btn
                unelevated
                color="primary"
                label="Crear Primer Tercero"
                icon="add"
                @click="handleNew"
                class="q-mt-md"
              />
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.page-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 24px;
}

.page-content {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  padding: 12px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 12px;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.2;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
  font-weight: 400;
}

.new-btn {
  height: 42px;
  padding: 0 24px;
  font-weight: 500;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
  }
}

.filters-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.filters-section {
  padding: 20px;
}

.filters-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;

  :deep(.q-field__control) {
    border-radius: 10px;
    height: 40px;
    background: #fafafa;

    &:hover {
      background: #f0f0f0;
    }
  }

  :deep(.q-field__native) {
    font-size: 14px;
    font-weight: 500;
  }
}

.search-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 500;
}

.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.modern-table {
  :deep(.q-table__top) {
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  :deep(.q-table__bottom) {
    padding: 16px 20px;
    border-top: 1px solid #e2e8f0;
  }

  :deep(thead tr th) {
    background: #f7fafc;
    color: #2d3748;
    font-weight: 600;
    font-size: 13px;
    padding: 16px 12px;
    border-bottom: 2px solid #e2e8f0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  :deep(tbody tr) {
    transition: all 0.2s ease;

    &:hover {
      background: #f7fafc;
    }
  }

  :deep(tbody td) {
    padding: 16px 12px;
    font-size: 14px;
    color: #2d3748;
    border-bottom: 1px solid #f0f0f0;
  }
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.no-data-text {
  margin: 16px 0 0;
  font-size: 16px;
  color: #718096;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .new-btn {
    width: 100%;
  }

  .filters-row {
    flex-direction: column;

    .search-input {
      max-width: 100%;
    }

    .search-btn {
      width: 100%;
    }
  }

  .page-title {
    font-size: 24px;
  }
}
</style>

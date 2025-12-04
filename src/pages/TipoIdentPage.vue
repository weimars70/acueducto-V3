<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { tipoIdentService } from '../services/api/tipo-ident.service';
import type { TipoIdent } from '../types/tipo-ident';

const $q = useQuasar();
const router = useRouter();
const tipoIdents = ref<TipoIdent[]>([]);
const loading = ref(true);
const filter = ref('');
const viewMode = ref<'table' | 'grid'>('table');
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
  { name: 'abreviado', label: 'Abreviado', field: 'abreviado', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const loadData = async () => {
  try {
    loading.value = true;
    const response = await tipoIdentService.getTipoIdents({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      nombre: filter.value || undefined
    });

    if (response && response.data) {
      tipoIdents.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      tipoIdents.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar tipos de identificación:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los tipos de identificación'
    });
    tipoIdents.value = [];
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
  router.push('/tipo-ident/new');
};

const handleEdit = (tipoIdent: TipoIdent) => {
  router.push(`/tipo-ident/edit/${tipoIdent.codigo}`);
};

const handleDelete = async (tipoIdent: TipoIdent) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el tipo de identificación "${tipoIdent.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await tipoIdentService.delete(tipoIdent.codigo);
      $q.notify({
        type: 'positive',
        message: 'Tipo de identificación eliminado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar tipo de identificación:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el tipo de identificación'
      });
    }
  });
};

const handleSearch = () => {
  pagination.value.page = 1;
  loadData();
};

const paginatedTipoIdents = computed(() => {
  if (viewMode.value === 'grid') {
    const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
    const end = start + pagination.value.rowsPerPage;
    return tipoIdents.value.slice(start, end);
  }
  return tipoIdents.value;
});

const totalPages = computed(() => {
  return Math.ceil(pagination.value.rowsNumber / pagination.value.rowsPerPage);
});

const nextPage = () => {
  if (pagination.value.page < totalPages.value) {
    pagination.value.page++;
    if (viewMode.value === 'table') {
      loadData();
    }
  }
};

const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    if (viewMode.value === 'table') {
      loadData();
    }
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page class="tipo-ident-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="badge" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Tipo Identificación</h1>
              <p class="page-subtitle">Gestión de tipos de identificación</p>
            </div>
          </div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Nuevo Tipo"
            class="action-btn"
            @click="handleNew"
          />
        </div>
      </div>

      <!-- Filtros y controles -->
      <q-card flat class="filter-card">
        <q-card-section class="filter-section">
          <div class="filter-controls">
            <q-input
              v-model="filter"
              placeholder="Buscar tipo..."
              outlined
              dense
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-icon
                  v-if="filter"
                  name="close"
                  class="cursor-pointer"
                  @click="filter = ''; handleSearch()"
                />
              </template>
            </q-input>

            <div class="view-toggle">
              <q-btn-toggle
                v-model="viewMode"
                unelevated
                toggle-color="primary"
                :options="[
                  { label: 'Tabla', value: 'table', icon: 'view_list' },
                  { label: 'Tarjetas', value: 'grid', icon: 'grid_view' }
                ]"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Vista de Tabla -->
      <q-card v-if="viewMode === 'table'" flat class="content-card">
        <q-table
          :rows="tipoIdents"
          :columns="columns"
          row-key="codigo"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          flat
          :rows-per-page-options="[10, 20, 50, 100]"
          class="modern-table"
        >
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <span class="text-weight-bold text-primary">{{ props.row.codigo }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon name="badge" size="20px" color="grey-6" class="q-mr-sm" />
                <span class="text-weight-medium">{{ props.row.nombre }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-abreviado="props">
            <q-td :props="props">
              <q-chip v-if="props.row.abreviado" color="info" text-color="white" size="sm" dense>
                {{ props.row.abreviado }}
              </q-chip>
              <span v-else class="text-grey-5">N/A</span>
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
              <q-icon name="badge" size="64px" color="grey-4" />
              <div class="text-center">
                <div class="text-h6 text-grey-6">No hay tipos de identificación registrados</div>
                <div class="text-caption text-grey-5">Comienza agregando un nuevo tipo</div>
              </div>
            </div>
          </template>
        </q-table>
      </q-card>

      <!-- Vista de Tarjetas -->
      <div v-else class="grid-container">
        <q-inner-loading :showing="loading">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>

        <div v-if="!loading && tipoIdents.length === 0" class="empty-state">
          <q-icon name="badge" size="96px" color="grey-4" />
          <h2 class="text-h5 text-grey-6 q-mt-md">No hay tipos de identificación registrados</h2>
          <p class="text-grey-5">Comienza agregando un nuevo tipo</p>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Agregar Tipo"
            @click="handleNew"
            class="q-mt-md"
          />
        </div>

        <div v-else class="cards-grid">
          <q-card
            v-for="tipoIdent in paginatedTipoIdents"
            :key="tipoIdent.codigo"
            class="tipo-card"
            flat
            bordered
          >
            <q-card-section class="card-header">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <q-avatar color="primary" text-color="white" size="48px">
                    <q-icon name="badge" size="28px" />
                  </q-avatar>
                  <div class="q-ml-md">
                    <div class="card-title">{{ tipoIdent.nombre }}</div>
                    <div class="card-code">Código: {{ tipoIdent.codigo }}</div>
                  </div>
                </div>
                <q-chip v-if="tipoIdent.abreviado" color="info" text-color="white" size="sm" dense>
                  {{ tipoIdent.abreviado }}
                </q-chip>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions class="card-actions">
              <q-btn
                flat
                icon="edit"
                label="Editar"
                color="primary"
                @click="handleEdit(tipoIdent)"
              />
              <q-btn
                flat
                icon="delete"
                label="Eliminar"
                color="negative"
                @click="handleDelete(tipoIdent)"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Paginación para vista de tarjetas -->
        <div v-if="tipoIdents.length > 0" class="grid-pagination">
          <q-btn
            flat
            icon="chevron_left"
            label="Anterior"
            :disable="pagination.page === 1"
            @click="prevPage"
          />
          <div class="pagination-info">
            Página {{ pagination.page }} de {{ totalPages }}
          </div>
          <q-btn
            flat
            icon-right="chevron_right"
            label="Siguiente"
            :disable="pagination.page >= totalPages"
            @click="nextPage"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.tipo-ident-page {
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
  font-weight: 600;
  padding: 0 24px;
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

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 280px;
  max-width: 500px;
}

.view-toggle {
  margin-left: auto;
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

.grid-container {
  position: relative;
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.tipo-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
    border-color: #cbd5e0;
  }
}

.card-header {
  padding: 20px;
  background: white;
  border-bottom: 3px solid #f7fafc;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.card-code {
  font-size: 13px;
  color: #718096;
  font-weight: 600;
}

.card-actions {
  padding: 12px 20px;
  background: white;
  justify-content: flex-end;
  gap: 8px;
}

.grid-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 32px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  font-size: 14px;
  color: #718096;
  font-weight: 600;
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

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }

  .view-toggle {
    margin-left: 0;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>

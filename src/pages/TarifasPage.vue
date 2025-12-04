<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { tarifaService } from '../services/api/tarifa.service';
import type { Tarifa } from '../types/tarifa';

const $q = useQuasar();
const router = useRouter();
const tarifas = ref<Tarifa[]>([]);
const loading = ref(true);
const filter = ref('');
const viewMode = ref<'table' | 'grid'>('table');
const pagination = ref({
  sortBy: 'desde',
  descending: true,
  page: 1,
  rowsPerPage: 12,
  rowsNumber: 0
});

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const, sortable: true },
  { name: 'basico', label: 'Básico', field: 'basico', align: 'right' as const, sortable: true },
  { name: 'complementario', label: 'Complementario', field: 'complementario', align: 'right' as const, sortable: true },
  { name: 'desde', label: 'Desde', field: 'desde', align: 'center' as const, sortable: true },
  { name: 'hasta', label: 'Hasta', field: 'hasta', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO');
};

const loadData = async () => {
  try {
    loading.value = true;
    const response = await tarifaService.getTarifas({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage
    });

    if (response && response.data) {
      tarifas.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      tarifas.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar tarifas:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las tarifas'
    });
    tarifas.value = [];
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
  router.push('/tarifas-maestro/new');
};

const handleEdit = (tarifa: Tarifa) => {
  router.push(`/tarifas-maestro/edit/${tarifa.id}`);
};

const handleDelete = async (tarifa: Tarifa) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar la tarifa #${tarifa.id}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await tarifaService.delete(tarifa.id);
      $q.notify({
        type: 'positive',
        message: 'Tarifa eliminada exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar tarifa:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar la tarifa'
      });
    }
  });
};

const paginatedTarifas = computed(() => {
  if (viewMode.value === 'grid') {
    const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
    const end = start + pagination.value.rowsPerPage;
    return tarifas.value.slice(start, end);
  }
  return tarifas.value;
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
  <q-page class="tarifas-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="payments" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Tarifas</h1>
              <p class="page-subtitle">Gestión de tarifas básicas y complementarias</p>
            </div>
          </div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Nueva Tarifa"
            class="action-btn"
            @click="handleNew"
          />
        </div>
      </div>

      <!-- Filtros y controles -->
      <q-card flat class="filter-card">
        <q-card-section class="filter-section">
          <div class="filter-controls">
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
          :rows="tarifas"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          flat
          :rows-per-page-options="[10, 20, 50, 100]"
          class="modern-table"
        >
          <template v-slot:body-cell-basico="props">
            <q-td :props="props">
              <span class="text-weight-bold text-positive">{{ formatCurrency(props.row.basico) }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-complementario="props">
            <q-td :props="props">
              <span class="text-weight-bold text-info">{{ formatCurrency(props.row.complementario) }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-desde="props">
            <q-td :props="props">
              <q-chip color="primary" text-color="white" size="sm" dense>
                {{ formatDate(props.row.desde) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-hasta="props">
            <q-td :props="props">
              <q-chip color="secondary" text-color="white" size="sm" dense>
                {{ formatDate(props.row.hasta) }}
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
              <q-icon name="payments" size="64px" color="grey-4" />
              <div class="text-center">
                <div class="text-h6 text-grey-6">No hay tarifas registradas</div>
                <div class="text-caption text-grey-5">Comienza agregando una nueva tarifa</div>
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

        <div v-if="!loading && tarifas.length === 0" class="empty-state">
          <q-icon name="payments" size="96px" color="grey-4" />
          <h2 class="text-h5 text-grey-6 q-mt-md">No hay tarifas registradas</h2>
          <p class="text-grey-5">Comienza agregando una nueva tarifa</p>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Agregar Tarifa"
            @click="handleNew"
            class="q-mt-md"
          />
        </div>

        <div v-else class="cards-grid">
          <q-card
            v-for="tarifa in paginatedTarifas"
            :key="tarifa.id"
            class="tarifa-card"
            flat
            bordered
          >
            <q-card-section class="card-header">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <q-avatar color="primary" text-color="white" size="48px">
                    <q-icon name="payments" size="28px" />
                  </q-avatar>
                  <div class="q-ml-md">
                    <div class="card-title">Tarifa #{{ tarifa.id }}</div>
                    <div class="card-code">{{ formatDate(tarifa.desde) }} - {{ formatDate(tarifa.hasta) }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="card-body">
              <div class="info-row">
                <q-icon name="attach_money" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Básico</div>
                  <div class="info-value text-positive">{{ formatCurrency(tarifa.basico) }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="add_circle" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Complementario</div>
                  <div class="info-value text-info">{{ formatCurrency(tarifa.complementario) }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="event" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Vigencia</div>
                  <div class="info-value">{{ formatDate(tarifa.desde) }} - {{ formatDate(tarifa.hasta) }}</div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions class="card-actions">
              <q-btn
                flat
                icon="edit"
                label="Editar"
                color="primary"
                @click="handleEdit(tarifa)"
              />
              <q-btn
                flat
                icon="delete"
                label="Eliminar"
                color="negative"
                @click="handleDelete(tarifa)"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Paginación para vista de tarjetas -->
        <div v-if="tarifas.length > 0" class="grid-pagination">
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
.tarifas-page {
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
  justify-content: flex-end;
  flex-wrap: wrap;
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

.tarifa-card {
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

.card-body {
  padding: 20px;
  background: #fafafa;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #2d3748;
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

  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>

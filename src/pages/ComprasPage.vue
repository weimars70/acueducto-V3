<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { compraService } from '../services/api/compras.service';
import type { Compra } from '../types/compra';

const $q = useQuasar();
const router = useRouter();
const compras = ref<Compra[]>([]);
const loading = ref(true);
const filter = ref('');
const viewMode = ref<'table' | 'grid'>('table');
const pagination = ref({
  sortBy: 'codigo',
  descending: true,
  page: 1,
  rowsPerPage: 12,
  rowsNumber: 0
});

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'factura', label: 'Factura', field: 'factura', align: 'left' as const, sortable: true },
  { name: 'fechahora', label: 'Fecha', field: 'fechahora', align: 'left' as const, sortable: true },
  { name: 'proveedor_nombre', label: 'Proveedor', field: 'proveedor_nombre', align: 'left' as const, sortable: true },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const, sortable: true },
  { name: 'saldo', label: 'Saldo', field: 'saldo', align: 'right' as const, sortable: true },
  { name: 'anulado', label: 'Estado', field: 'anulado', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const loadData = async () => {
  try {
    loading.value = true;
    const response = await compraService.getCompras({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      factura: filter.value || undefined
    });

    if (response && response.data) {
      compras.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      compras.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar compras:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las compras'
    });
    compras.value = [];
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
  router.push('/compras/new');
};

const handleEdit = (compra: Compra) => {
  router.push(`/compras/edit/${compra.codigo}`);
};

const handleDelete = async (compra: Compra) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar la compra #${compra.codigo} - Factura ${compra.factura}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await compraService.delete(compra.codigo!);
      $q.notify({
        type: 'positive',
        message: 'Compra eliminada exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar compra:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar la compra'
      });
    }
  });
};

const handleSearch = () => {
  pagination.value.page = 1;
  loadData();
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value || 0);
};

const formatDate = (date: string | Date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-CO');
};

const paginatedCompras = computed(() => {
  if (viewMode.value === 'grid') {
    const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
    const end = start + pagination.value.rowsPerPage;
    return compras.value.slice(start, end);
  }
  return compras.value;
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
  <q-page class="compras-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="shopping_cart" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Compras</h1>
              <p class="page-subtitle">Gestión de compras y proveedores</p>
            </div>
          </div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Nueva Compra"
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
              placeholder="Buscar por factura..."
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
          :rows="compras"
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
              <span class="text-weight-bold text-primary">#{{ props.row.codigo }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-factura="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon name="receipt" size="20px" color="grey-6" class="q-mr-sm" />
                <span class="text-weight-medium">{{ props.row.factura }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-fechahora="props">
            <q-td :props="props">
              {{ formatDate(props.row.fechahora) }}
            </q-td>
          </template>

          <template v-slot:body-cell-total="props">
            <q-td :props="props">
              <span class="text-weight-bold">{{ formatCurrency(props.row.total) }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-saldo="props">
            <q-td :props="props">
              <span :class="props.row.saldo > 0 ? 'text-negative' : 'text-positive'">
                {{ formatCurrency(props.row.saldo) }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-anulado="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.anulado ? 'negative' : 'positive'"
                text-color="white"
                size="sm"
                dense
              >
                {{ props.row.anulado ? 'Anulado' : 'Activo' }}
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
                  icon="visibility"
                  color="info"
                  size="sm"
                  @click="handleEdit(props.row)"
                >
                  <q-tooltip>Ver</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  size="sm"
                  @click="handleEdit(props.row)"
                  v-if="!props.row.anulado"
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
                  v-if="!props.row.anulado"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-md q-py-xl">
              <q-icon name="shopping_cart" size="64px" color="grey-4" />
              <div class="text-center">
                <div class="text-h6 text-grey-6">No hay compras registradas</div>
                <div class="text-caption text-grey-5">Comienza agregando una nueva compra</div>
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

        <div v-if="!loading && compras.length === 0" class="empty-state">
          <q-icon name="shopping_cart" size="96px" color="grey-4" />
          <h2 class="text-h5 text-grey-6 q-mt-md">No hay compras registradas</h2>
          <p class="text-grey-5">Comienza agregando una nueva compra</p>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Agregar Compra"
            @click="handleNew"
            class="q-mt-md"
          />
        </div>

        <div v-else class="cards-grid">
          <q-card
            v-for="compra in paginatedCompras"
            :key="compra.codigo"
            class="compra-card"
            flat
            bordered
          >
            <q-card-section class="card-header">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <q-avatar color="primary" text-color="white" size="48px">
                    <q-icon name="shopping_cart" size="28px" />
                  </q-avatar>
                  <div class="q-ml-md">
                    <div class="card-title">Factura {{ compra.factura }}</div>
                    <div class="card-code">#{{ compra.codigo }}</div>
                  </div>
                </div>
                <q-chip
                  :color="compra.anulado ? 'negative' : 'positive'"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ compra.anulado ? 'Anulado' : 'Activo' }}
                </q-chip>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="card-body">
              <div class="info-row">
                <q-icon name="person" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Proveedor</div>
                  <div class="info-value">{{ compra.proveedor_nombre || 'N/A' }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="calendar_today" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Fecha</div>
                  <div class="info-value">{{ formatDate(compra.fechahora) }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="attach_money" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Total</div>
                  <div class="info-value text-weight-bold">{{ formatCurrency(compra.total) }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="account_balance_wallet" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Saldo</div>
                  <div class="info-value" :class="compra.saldo && compra.saldo > 0 ? 'text-negative' : 'text-positive'">
                    {{ formatCurrency(compra.saldo || 0) }}
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions class="card-actions">
              <q-btn
                flat
                icon="visibility"
                label="Ver"
                color="info"
                @click="handleEdit(compra)"
              />
              <q-btn
                v-if="!compra.anulado"
                flat
                icon="delete"
                label="Eliminar"
                color="negative"
                @click="handleDelete(compra)"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Paginación para vista de tarjetas -->
        <div v-if="compras.length > 0" class="grid-pagination">
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
.compras-page {
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

.compra-card {
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

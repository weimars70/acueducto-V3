<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { bancoService } from '../services/api/banco.service';
import type { Banco } from '../types/banco';
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const router = useRouter();
const { exportToExcel, exportToPDF } = useExport();
const bancos = ref<Banco[]>([]);
const loading = ref(true);
const filter = ref('');
const viewMode = ref<'table' | 'grid'>('table'); // 'table' o 'grid'
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

const paginatedBancos = computed(() => {
  if (viewMode.value === 'grid') {
    const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
    const end = start + pagination.value.rowsPerPage;
    return bancos.value.slice(start, end);
  }
  return bancos.value;
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

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' },
      { field: 'numero_cuenta', label: 'Número de Cuenta' },
      { field: 'titular', label: 'Titular' },
      { field: 'entidad_financiera', label: 'Entidad Financiera' },
      { field: 'moneda', label: 'Moneda' }
    ];
    exportToExcel(bancos.value, exportColumns, 'bancos');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' },
      { field: 'numero_cuenta', label: 'Número de Cuenta' },
      { field: 'titular', label: 'Titular' },
      { field: 'entidad_financiera', label: 'Entidad Financiera' },
      { field: 'moneda', label: 'Moneda' }
    ];
    exportToPDF(bancos.value, exportColumns, 'bancos', 'Listado de Bancos');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page class="bancos-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="account_balance" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Bancos</h1>
              <p class="page-subtitle">Gestión de cuentas bancarias</p>
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn outline color="positive" icon="description" label="Excel" @click="handleExportExcel" no-caps class="export-btn">
              <q-tooltip>Exportar a Excel</q-tooltip>
            </q-btn>
            <q-btn outline color="negative" icon="picture_as_pdf" label="PDF" @click="handleExportPDF" no-caps class="export-btn">
              <q-tooltip>Exportar a PDF</q-tooltip>
            </q-btn>
            <q-btn unelevated color="primary" icon="add" label="Nuevo Banco" class="action-btn" @click="handleNew" />
          </div>
        </div>
      </div>

      <!-- Filtros y controles -->
      <q-card flat class="filter-card">
        <q-card-section class="filter-section">
          <div class="filter-controls">
            <q-input
              v-model="filter"
              placeholder="Buscar banco..."
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
          :rows="bancos"
          :columns="columns"
          row-key="id"
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
                <q-icon name="account_balance" size="20px" color="grey-6" class="q-mr-sm" />
                <span class="text-weight-medium">{{ props.row.nombre }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-activa="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.activa ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
                dense
              >
                {{ props.row.activa ? 'Activa' : 'Inactiva' }}
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
              <q-icon name="account_balance" size="64px" color="grey-4" />
              <div class="text-center">
                <div class="text-h6 text-grey-6">No hay bancos registrados</div>
                <div class="text-caption text-grey-5">Comienza agregando un nuevo banco</div>
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

        <div v-if="!loading && bancos.length === 0" class="empty-state">
          <q-icon name="account_balance" size="96px" color="grey-4" />
          <h2 class="text-h5 text-grey-6 q-mt-md">No hay bancos registrados</h2>
          <p class="text-grey-5">Comienza agregando un nuevo banco</p>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Agregar Banco"
            @click="handleNew"
            class="q-mt-md"
          />
        </div>

        <div v-else class="cards-grid">
          <q-card
            v-for="banco in paginatedBancos"
            :key="banco.id"
            class="banco-card"
            flat
            bordered
          >
            <q-card-section class="card-header">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <q-avatar color="primary" text-color="white" size="48px">
                    <q-icon name="account_balance" size="28px" />
                  </q-avatar>
                  <div class="q-ml-md">
                    <div class="card-title">{{ banco.nombre }}</div>
                    <div class="card-code">{{ banco.codigo }}</div>
                  </div>
                </div>
                <q-chip
                  :color="banco.activa ? 'positive' : 'negative'"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ banco.activa ? 'Activa' : 'Inactiva' }}
                </q-chip>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="card-body">
              <div class="info-row">
                <q-icon name="credit_card" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Número de Cuenta</div>
                  <div class="info-value">{{ banco.numero_cuenta || 'N/A' }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="person" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Titular</div>
                  <div class="info-value">{{ banco.titular || 'N/A' }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="business" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Entidad Financiera</div>
                  <div class="info-value">{{ banco.entidad_financiera || 'N/A' }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="monetization_on" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Moneda</div>
                  <div class="info-value">{{ banco.moneda || 'N/A' }}</div>
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
                @click="handleEdit(banco)"
              />
              <q-btn
                flat
                icon="delete"
                label="Eliminar"
                color="negative"
                @click="handleDelete(banco)"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Paginación para vista de tarjetas -->
        <div v-if="bancos.length > 0" class="grid-pagination">
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
.bancos-page {
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

.banco-card {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.export-btn {
  min-width: 90px;
  height: 36px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

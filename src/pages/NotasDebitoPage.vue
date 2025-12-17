<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { notaDebitoService } from '../services/api/nota-debito.service';
import type { NotaDebito } from '../types/nota-debito';

const $q = useQuasar();
const router = useRouter();
const notasDebito = ref<NotaDebito[]>([]);
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
  { name: 'instalacionCodigo', label: 'Instalación', field: 'instalacionCodigo', align: 'left' as const, sortable: true },
  { name: 'clienteNombre', label: 'Cliente', field: 'clienteNombre', align: 'left' as const, sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' as const, sortable: true },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'right' as const, sortable: true },
  { name: 'disponible', label: 'Disponible', field: 'disponible', align: 'right' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const loadData = async () => {
  try {
    loading.value = true;
    const data = await notaDebitoService.getAll();
    notasDebito.value = data;
    pagination.value.rowsNumber = data.length;
  } catch (error) {
    console.error('Error al cargar notas de débito:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las notas de débito'
    });
    notasDebito.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const handleNew = () => {
  router.push('/notas-debito/nuevo');
};

const handleEdit = (notaDebito: NotaDebito) => {
  // router.push(`/notas-debito/editar/${notaDebito.codigo}/${notaDebito.empresaId}`);
  // Implementar edición si se requiere, por ahora solo crear/eliminar
    $q.notify({
      type: 'info',
      message: 'Funcionalidad de edición en desarrollo'
    });
};

const handleDelete = async (notaDebito: NotaDebito) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar la nota de débito #${notaDebito.codigo}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await notaDebitoService.delete(notaDebito.codigo, notaDebito.empresaId);
      $q.notify({
        type: 'positive',
        message: 'Nota de débito eliminada exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar nota de débito:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar la nota de débito'
      });
    }
  });
};

const filteredNotasDebito = computed(() => {
  if (!filter.value) return notasDebito.value;

  const searchTerm = filter.value.toLowerCase();
  return notasDebito.value.filter(nd =>
    nd.codigo?.toString().includes(searchTerm) ||
    nd.clienteNombre?.toLowerCase().includes(searchTerm) ||
    nd.instalacionCodigo?.toString().includes(searchTerm)
  );
});

const paginatedNotasDebito = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return filteredNotasDebito.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredNotasDebito.value.length / pagination.value.rowsPerPage);
});

const nextPage = () => {
  if (pagination.value.page < totalPages.value) {
    pagination.value.page++;
  }
};

const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--;
  }
};

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-CO');
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page class="notas-debito-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="description" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Notas Débito</h1>
              <p class="page-subtitle">Gestión de notas débito</p>
            </div>
          </div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Nueva Nota Débito"
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
              placeholder="Buscar por código, cliente o instalación..."
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
          :rows="paginatedNotasDebito"
          :columns="columns"
          row-key="codigo"
          :loading="loading"
          flat
          hide-pagination
          class="modern-table"
        >
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <span class="text-weight-bold text-primary">#{{ props.row.codigo }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-instalacionCodigo="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon name="home" size="20px" color="grey-6" class="q-mr-sm" />
                <span>{{ props.row.instalacionCodigo }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-clienteNombre="props">
            <q-td :props="props">
              <span class="text-weight-medium">{{ props.row.clienteNombre || 'N/A' }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-fecha="props">
            <q-td :props="props">
              {{ formatDate(props.row.fecha) }}
            </q-td>
          </template>

          <template v-slot:body-cell-valor="props">
            <q-td :props="props">
              <span class="text-weight-bold">{{ formatCurrency(props.row.valor) }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-disponible="props">
            <q-td :props="props">
              <q-chip
                :color="(props.row.disponible || 0) > 0 ? 'positive' : 'grey'"
                text-color="white"
                size="sm"
                dense
              >
                {{ formatCurrency(props.row.disponible) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <!-- 
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
                -->
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
              <q-icon name="description" size="64px" color="grey-4" />
              <div class="text-center">
                <div class="text-h6 text-grey-6">No hay notas débito registradas</div>
                <div class="text-caption text-grey-5">Comienza agregando una nueva nota débito</div>
              </div>
            </div>
          </template>
        </q-table>

        <!-- Paginación -->
        <div v-if="filteredNotasDebito.length > 0" class="table-pagination">
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
      </q-card>

      <!-- Vista de Tarjetas -->
      <div v-else class="grid-container">
        <q-inner-loading :showing="loading">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>

        <div v-if="!loading && filteredNotasDebito.length === 0" class="empty-state">
          <q-icon name="description" size="96px" color="grey-4" />
          <h2 class="text-h5 text-grey-6 q-mt-md">No hay notas débito registradas</h2>
          <p class="text-grey-5">Comienza agregando una nueva nota débito</p>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Agregar Nota Débito"
            @click="handleNew"
            class="q-mt-md"
          />
        </div>

        <div v-else class="cards-grid">
          <q-card
            v-for="nd in paginatedNotasDebito"
            :key="`${nd.codigo}-${nd.empresaId}`"
            class="nota-card"
            flat
            bordered
          >
            <q-card-section class="card-header">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <q-avatar color="primary" text-color="white" size="48px">
                    <q-icon name="description" size="28px" />
                  </q-avatar>
                  <div class="q-ml-md">
                    <div class="card-title">Nota #{{ nd.codigo }}</div>
                    <div class="card-code">{{ nd.clienteNombre || 'Sin cliente' }}</div>
                  </div>
                </div>
                <q-chip
                  :color="(nd.disponible || 0) > 0 ? 'positive' : 'grey'"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ (nd.disponible || 0) > 0 ? 'Disponible' : 'Agotada' }}
                </q-chip>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="card-body">
              <div class="info-row">
                <q-icon name="home" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Instalación</div>
                  <div class="info-value">{{ nd.instalacionCodigo }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="event" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Fecha</div>
                  <div class="info-value">{{ formatDate(nd.fecha) }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="attach_money" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Valor Total</div>
                  <div class="info-value">{{ formatCurrency(nd.valor) }}</div>
                </div>
              </div>

              <div class="info-row">
                <q-icon name="account_balance_wallet" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Disponible</div>
                  <div class="info-value text-positive">{{ formatCurrency(nd.disponible) }}</div>
                </div>
              </div>

              <div v-if="nd.observacion" class="info-row">
                <q-icon name="notes" size="20px" color="grey-7" />
                <div class="info-content">
                  <div class="info-label">Observación</div>
                  <div class="info-value">{{ nd.observacion }}</div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions class="card-actions">
              <!--
              <q-btn
                flat
                icon="edit"
                label="Editar"
                color="primary"
                @click="handleEdit(nd)"
              />
              -->
              <q-btn
                flat
                icon="delete"
                label="Eliminar"
                color="negative"
                @click="handleDelete(nd)"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Paginación para vista de tarjetas -->
        <div v-if="filteredNotasDebito.length > 0" class="grid-pagination">
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
.notas-debito-page {
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

.table-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
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

.nota-card {
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

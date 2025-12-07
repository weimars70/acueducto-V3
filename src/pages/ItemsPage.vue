<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { itemsService } from '../services/api/items.service';
import { useAuthStore } from '../stores/auth';
import type { Item } from '../types/item';
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const { exportToExcel, exportToPDF } = useExport();
const items = ref<Item[]>([]);
const loading = ref(true);
const filter = ref('');
const pagination = ref({
  rowsPerPage: 10
});

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { 
    name: 'precio_sin_iva', 
    label: 'Precio Sin IVA', 
    field: 'precioSinIva', 
    align: 'right' as const, 
    sortable: true,
    format: (val: number) => `$ ${val.toLocaleString('es-CO')}`
  },
  { 
    name: 'precio_total', 
    label: 'Precio Total', 
    field: 'precioTotal', 
    align: 'right' as const, 
    sortable: true,
    format: (val: number) => `$ ${val.toLocaleString('es-CO')}`
  },
  { 
    name: 'cantidad', 
    label: 'Inventario', 
    field: 'inventarioActual', 
    align: 'center' as const, 
    sortable: true
  },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const loadData = async () => {
  try {
    loading.value = true;
    const empresaId = authStore.user?.empresaId || 1;
    const data = await itemsService.getByEmpresa(empresaId);
    items.value = data || [];
  } catch (error) {
    console.error('Error al cargar items:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los items'
    });
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredData = () => {
  if (!filter.value) return items.value;
  const search = filter.value.toLowerCase();
  return items.value.filter(item =>
    item.nombre.toLowerCase().includes(search) ||
    (item.codigo && item.codigo.toLowerCase().includes(search))
  );
};

const handleNew = () => {
  router.push('/items/new');
};

const handleEdit = (item: Item) => {
  router.push(`/items/edit/${item.id}`);
};

const handleDelete = async (item: Item) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el item ${item.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await itemsService.delete(item.id);
      $q.notify({
        type: 'positive',
        message: 'Item eliminado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar item:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el item'
      });
    }
  });
};

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' },
      { field: 'precioSinIva', label: 'Precio Sin IVA' },
      { field: 'precioTotal', label: 'Precio Total' },
      { field: 'inventarioActual', label: 'Inventario' }
    ];
    exportToExcel(filteredData(), exportColumns, 'items');
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
      { field: 'precioSinIva', label: 'Precio Sin IVA' },
      { field: 'precioTotal', label: 'Precio Total' },
      { field: 'inventarioActual', label: 'Inventario' }
    ];
    exportToPDF(filteredData(), exportColumns, 'items', 'Listado de Items');
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
  <q-page class="page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="inventory_2" size="32px" color="primary" class="q-mr-sm" />
            <div>
              <h1 class="page-title">Items</h1>
              <p class="page-subtitle">Gestión de productos y servicios</p>
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              outline
              color="positive"
              icon="description"
              label="Excel"
              @click="handleExportExcel"
              no-caps
              class="export-btn"
            >
              <q-tooltip>Exportar a Excel</q-tooltip>
            </q-btn>
            <q-btn
              outline
              color="negative"
              icon="picture_as_pdf"
              label="PDF"
              @click="handleExportPDF"
              no-caps
              class="export-btn"
            >
              <q-tooltip>Exportar a PDF</q-tooltip>
            </q-btn>
            <q-btn
              unelevated
              color="primary"
              icon="add"
              label="Nuevo Item"
              class="action-btn"
              @click="handleNew"
            />
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <q-card flat class="filter-card">
        <q-card-section class="filter-section">
          <q-input
            v-model="filter"
            placeholder="Buscar por nombre o código..."
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
          row-key="id"
          :loading="loading"
          flat
          :rows-per-page-options="[10, 20, 50]"
          v-model:pagination="pagination"
          rows-per-page-label="Registros por página"
          class="modern-table"
        >
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <span class="text-weight-bold text-grey-8">{{ props.row.codigo || '-' }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="flex items-center">
                <span class="text-weight-medium">{{ props.row.nombre }}</span>
              </div>
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
              <q-icon name="inventory_2" size="64px" color="grey-4" />
              <div class="text-center">
                <div class="text-h6 text-grey-6">No hay items registrados</div>
                <div class="text-caption text-grey-5">Comienza agregando un nuevo item</div>
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

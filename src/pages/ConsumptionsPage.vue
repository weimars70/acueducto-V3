<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { io } from 'socket.io-client';
import { consumptionService } from '../services/api';
import { useExport } from '../composables/useExport';
import { useScreenSize } from '../composables/useScreenSize';
import ViewToggle from '../components/ViewToggle.vue';
import ConsumptionGrid from '../components/ConsumptionGrid.vue';
import ConsumptionTable from '../components/table/ConsumptionTable.vue';
import ConsumptionFilters from '../components/filters/ConsumptionFilters.vue';
import type { Consumption } from '../types/consumption';

const $q = useQuasar();
const router = useRouter();
const { exportToExcel, exportToPDF } = useExport();
const { isMobile } = useScreenSize();
const view = ref<'grid' | 'list'>(isMobile.value ? 'grid' : 'list');
const consumptions = ref<Consumption[]>([]);
const loading = ref(true);
const currentFilters = ref({});
const socket = ref<any>(null);
const pagination = ref({
  sortBy: 'codigo',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0 // Esto debe ser actualizado por el backend
});

const imageDialog = ref({
  show: false,
  url: '',
  loading: false
});

watch(isMobile, (newValue) => {
  view.value = newValue ? 'grid' : 'list';
});

const loadData = async () => {
   
  console.log('🚀 Cargando datos...');
  try {
    loading.value = true;
    
    // CAMBIO IMPORTANTE: Usar paginación real del servidor
    const response = await consumptionService.getConsumptions({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      ...currentFilters.value
    });
    console.log('✅ Datos encontrados:', response);

    if (response && response.data) {
      console.log('✅ Datos encontrados:', {
        dataLength: response.data.length,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        firstItem: response.data[0] || 'No hay elementos'
      });
      
      consumptions.value = response.data;
      
      // CAMBIO IMPORTANTE: Usar el total del servidor, no la longitud local
      if (response.total !== undefined) {
        pagination.value.rowsNumber = response.total;
        console.log('📈 Total desde backend:', response.total);
      } else {
        // TEMPORAL: Simular 100 registros para probar
        pagination.value.rowsNumber = 100; // Cambia esto por el total real
        console.warn('⚠️ No se encontró total en la respuesta, usando valor temporal');
      }
      
      console.log('🎯 Estado final:', {
        consumptionsCount: consumptions.value.length,
        paginationRowsNumber: pagination.value.rowsNumber,
        currentPage: pagination.value.page,
        rowsPerPage: pagination.value.rowsPerPage
      });
    } else {
      console.warn('⚠️ No se encontraron datos o estructura incorrecta');
      console.log('🔍 Detalles de respuesta vacía:', {
        response,
        hasResponse: !!response,
        responseKeys: response ? Object.keys(response) : 'No response'
      });
      consumptions.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    console.error('🔍 Detalles del error:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error
    });
    consumptions.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
    console.log('🏁 Carga de datos finalizada');
  }
};

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'instalacion', label: 'Instalación' },
      { field: 'nombre', label: 'Nombre' },
      { field: 'lectura', label: 'Lectura' },
      { field: 'fecha', label: 'Fecha' },
      { field: 'mes', label: 'Mes' },
      { field: 'year', label: 'Año' },
      { field: 'consumo', label: 'Consumo' },
      { field: 'medidor', label: 'Medidor' },
      { field: 'facturado', label: 'Facturado' }
    ];
    exportToExcel(consumptions.value, exportColumns, 'consumos');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'instalacion', label: 'Instalación' },
      { field: 'nombre', label: 'Nombre' },
      { field: 'lectura', label: 'Lectura' },
      { field: 'fecha', label: 'Fecha' },
      { field: 'consumo', label: 'Consumo' },
      { field: 'facturado', label: 'Facturado' }
    ];
    exportToPDF(consumptions.value, exportColumns, 'consumos', 'Listado de Consumos');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

const handleNewRecord = () => {
  router.push('/consumptions/new');
};

const handleFilter = async (filters: any) => {
  currentFilters.value = filters;
  pagination.value.page = 1;
  await loadData();
};

const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending };
  await loadData();
};

const handleViewImage = async (row: Consumption) => {
  imageDialog.value.show = true;
  imageDialog.value.loading = true;
  imageDialog.value.url = '';
  
  try {
    const url = await consumptionService.getImage(row.codigo);
    imageDialog.value.url = url;
  } catch (error) {
    console.error('Error loading image:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la imagen'
    });
    imageDialog.value.show = false;
  } finally {
    imageDialog.value.loading = false;
  }
};

const setupSocketConnection = () => {
  socket.value = io('http://2.58.80.90:3007', {
    transports: ['websocket'],
    autoConnect: true
  });

  socket.value.on('connect', () => {
    console.log('Conectado al servidor de Socket.IO');
  });

  socket.value.on('consumo_update', (data: any) => {
    console.log('Actualización de consumo recibida:', data);
    if (data.type === 'consumo_update' && data.operation === 'INSERT') {
      // Agregar el nuevo consumo al inicio de la lista
      consumptions.value.unshift(data.record);
      
      // Actualizar el contador total
      pagination.value.rowsNumber += 1;
      
      $q.notify({
        type: 'positive',
        message: 'Nuevo consumo registrado',
        position: 'top'
      });
    }
  });

  socket.value.on('disconnect', () => {
    console.log('Desconectado del servidor de Socket.IO');
  });

  socket.value.on('error', (error: any) => {
    console.error('Error de Socket.IO:', error);
  });
};

onMounted(() => {
  setupSocketConnection();
  loadData();
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
});
</script>

<template>
  <q-page padding>
    <div class="consumption-page q-pa-md">
      <div class="page-header q-mb-md">
        <div class="row items-center no-wrap">
          <div class="col">
            <ConsumptionFilters @filter="handleFilter" />
          </div>
          <div class="col-auto actions-wrapper q-ml-sm">
            <div class="row items-center no-wrap q-gutter-x-xs">
              <ViewToggle v-model="view" />
              <q-btn
                outline
                color="positive"
                icon="description"
                :label="isMobile ? undefined : 'Excel'"
                @click="handleExportExcel"
                no-caps
                class="export-btn"
                :size="isMobile ? 'sm' : 'md'"
              >
                <q-tooltip>Exportar a Excel</q-tooltip>
              </q-btn>
              <q-btn
                outline
                color="negative"
                icon="picture_as_pdf"
                :label="isMobile ? undefined : 'PDF'"
                @click="handleExportPDF"
                no-caps
                class="export-btn"
                :size="isMobile ? 'sm' : 'md'"
              >
                <q-tooltip>Exportar a PDF</q-tooltip>
              </q-btn>
              <q-btn
                unelevated
                color="primary"
                icon="add"
                :label="isMobile ? undefined : 'Nuevo'"
                @click="handleNewRecord"
                class="action-btn"
                :size="isMobile ? 'sm' : 'md'"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <template v-if="view === 'list'">
          <ConsumptionTable
            :rows="consumptions"
            :loading="loading"
            :pagination="pagination"
            @request="onRequest"
            @view-image="handleViewImage"
          />
        </template>
        <template v-else>
          <div class="grid-container">
            <ConsumptionGrid :items="consumptions" />
            
            <div class="row justify-center q-mt-md">
              <q-pagination
                v-model="pagination.page"
                :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                :max-pages="6"
                boundary-links
                direction-links
                color="primary"
                @update:model-value="page => onRequest({ pagination: { ...pagination, page } })"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <q-dialog v-model="imageDialog.show" maximized>
      <q-card class="bg-black text-white">
        <q-bar>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="flex flex-center full-height scroll">
          <q-spinner v-if="imageDialog.loading" color="white" size="3em" />
          <img
            v-else-if="imageDialog.url"
            :src="imageDialog.url"
            style="max-width: 100%; max-height: 90vh; object-fit: contain;"
          />
          <div v-else>No se pudo cargar la imagen</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style lang="scss" scoped>
.consumption-page {
  .page-header .row {
    flex-wrap: nowrap;
  }

  .actions-wrapper {
    white-space: nowrap;
  }

  .q-btn {
    min-width: unset;
  }

  .grid-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 599px) {
    .page-header .row {
      flex-wrap: wrap;
      row-gap: 8px;

      .col {
        width: 100%;
      }

      .actions-wrapper {
        width: 100%;
        justify-content: flex-end;
        display: flex;
      }
    }
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

.action-btn {
  height: 38px;
  padding: 0 20px;
  font-weight: 500;
  font-size: 13px;
  border-radius: 8px;
}
</style>
<template>
  <q-page style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
    <div class="q-pa-md">
      <!-- Header con estadísticas -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
            <div class="row items-center q-mb-md">
              <div class="col">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <q-icon name="inventory" size="32px" color="primary" />
                  <h5 style="margin: 0; font-weight: 600; color: #2c3e50;">Ajustes de Inventario</h5>
                </div>
              </div>
              <div class="col-auto">
                <q-btn-dropdown
                  label="Nuevo Ajuste"
                  icon="add"
                  color="primary"
                  unelevated
                  style="border-radius: 12px; padding: 10px 24px; height: 48px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s ease;"
                >
                  <q-list>
                    <q-item clickable v-close-popup @click="$router.push('/ajustes-inventario/nuevo')">
                      <q-item-section avatar>
                        <q-icon name="edit_note" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Ajuste Simple</q-item-label>
                        <q-item-label caption>Un item a la vez</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="$router.push('/ajustes-inventario/nuevo-multiple')">
                      <q-item-section avatar>
                        <q-icon name="playlist_add" color="secondary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Ajuste Múltiple</q-item-label>
                        <q-item-label caption>Varios items a la vez</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="$router.push('/tipos-ajuste-inventario')">
                      <q-item-section avatar>
                        <q-icon name="settings" color="orange" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Tipos de Ajuste</q-item-label>
                        <q-item-label caption>Configurar tipos</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
            </div>

            <!-- Estadísticas -->
            <div class="row q-col-gutter-md" v-if="estadisticas">
              <div class="col-4">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 16px; color: white;">
                  <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Total Ajustes</div>
                  <div style="font-size: 24px; font-weight: 700;">{{ estadisticas.total_ajustes || 0 }}</div>
                </div>
              </div>
              <div class="col-4">
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 16px; color: white;">
                  <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Entradas (+)</div>
                  <div style="font-size: 24px; font-weight: 700;">{{ estadisticas.total_entradas || 0 }}</div>
                </div>
              </div>
              <div class="col-4">
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; padding: 16px; color: white;">
                  <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Salidas (-)</div>
                  <div style="font-size: 24px; font-weight: 700;">{{ estadisticas.total_salidas || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-input
            v-model="filters.itemNombre"
            outlined
            label="Buscar por item"
            dense
            clearable
            @keyup.enter="loadAjustes"
            style="background: white; border-radius: 12px;"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filters.tipoAjuste"
            outlined
            label="Tipo de ajuste"
            dense
            clearable
            :options="tipoAjusteOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            @update:model-value="loadAjustes"
            style="background: white; border-radius: 12px;"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-btn
            label="Buscar"
            icon="search"
            color="primary"
            unelevated
            @click="loadAjustes"
            class="full-width"
            style="border-radius: 12px; height: 40px;"
          />
        </div>
      </div>

      <!-- Tabla de ajustes -->
      <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
        <q-table
          :rows="ajustes"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          :pagination="pagination"
          @request="onRequest"
          binary-state-sort
        >
          <template v-slot:body-cell-tipo_ajuste="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.tipo_ajuste === '+' ? 'positive' : props.row.tipo_ajuste === '-' ? 'negative' : 'primary'"
                :label="props.row.tipo_ajuste === '+' ? 'Entrada (+)' : props.row.tipo_ajuste === '-' ? 'Salida (-)' : 'Inventario Inicial'"
                style="padding: 6px 12px; font-size: 12px; font-weight: 600;"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-cantidad="props">
            <q-td :props="props">
              <span :style="{ color: props.row.tipo_ajuste === '+' ? '#10b981' : '#ef4444', fontWeight: 600 }">
                {{ props.row.tipo_ajuste }}{{ props.row.cantidad }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-inventario="props">
            <q-td :props="props">
              <div style="font-size: 12px;">
                <div>
                  <span style="color: #6b7280;">Anterior:</span>
                  <span style="font-weight: 600; margin-left: 4px;">{{ props.row.inventario_anterior }}</span>
                </div>
                <div>
                  <span style="color: #6b7280;">Nuevo:</span>
                  <span style="font-weight: 600; margin-left: 4px; color: #3b82f6;">{{ props.row.inventario_nuevo }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-fecha="props">
            <q-td :props="props">
              {{ formatDate(props.row.fecha) }}
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ajustesInventarioService, type AjusteInventario, type Estadisticas } from '../services/api/ajustes-inventario.service';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const ajustes = ref<AjusteInventario[]>([]);
const loading = ref(false);
const estadisticas = ref<Estadisticas | null>(null);

const filters = ref({
  itemNombre: '',
  tipoAjuste: null as '+' | '-' | null
});

const tipoAjusteOptions = [
  { label: 'Entrada (+)', value: '+' },
  { label: 'Salida (-)', value: '-' },
  { label: 'Inventario Inicial', value: 'inicial' }
];

const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
});

const columns = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'item_nombre',
    label: 'Item',
    field: 'item_nombre',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'tipo_ajuste',
    label: 'Tipo',
    field: 'tipo_ajuste',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: 'cantidad',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'inventario',
    label: 'Inventario',
    field: 'inventario_nuevo',
    align: 'center' as const
  },
  {
    name: 'motivo',
    label: 'Motivo',
    field: 'motivo',
    align: 'left' as const
  },
  {
    name: 'usuario',
    label: 'Usuario',
    field: 'usuario',
    align: 'left' as const
  }
];

const loadAjustes = async () => {
  loading.value = true;
  try {
    const response = await ajustesInventarioService.getAjustes({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      ...filters.value
    });

    ajustes.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al cargar ajustes',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const loadEstadisticas = async () => {
  try {
    estadisticas.value = await ajustesInventarioService.getEstadisticas();
  } catch (error: any) {
    console.error('Error al cargar estadísticas:', error);
  }
};

const onRequest = (props: any) => {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  loadAjustes();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadAjustes();
  loadEstadisticas();
});
</script>

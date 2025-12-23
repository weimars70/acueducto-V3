<template>
  <q-page style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
    <div class="q-pa-md">
      <!-- Header con estadísticas -->
      <div class="row q-mb-md">
        <div class="col-12">
          <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
            <div class="row items-center q-col-gutter-md">
              <!-- Título -->
              <div class="col-12 col-md-auto">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <q-icon name="inventory" size="32px" color="primary" />
                  <h5 style="margin: 0; font-weight: 600; color: #2c3e50; white-space: nowrap;">Ajustes de Inventario</h5>
                </div>
              </div>

              <!-- Estadísticas -->
              <div class="col-12 col-md" v-if="estadisticas">
                <div class="row q-col-gutter-sm">
                  <div class="col-4 col-md">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 12px; color: white; text-align: center;">
                      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 2px;">Total Ajustes</div>
                      <div style="font-size: 20px; font-weight: 700;">{{ estadisticas.total_ajustes || 0 }}</div>
                    </div>
                  </div>
                  <div class="col-4 col-md">
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 12px; color: white; text-align: center;">
                      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 2px;">Entradas (+)</div>
                      <div style="font-size: 20px; font-weight: 700;">{{ estadisticas.total_entradas || 0 }}</div>
                    </div>
                  </div>
                  <div class="col-4 col-md">
                    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; padding: 12px; color: white; text-align: center;">
                      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 2px;">Salidas (-)</div>
                      <div style="font-size: 20px; font-weight: 700;">{{ estadisticas.total_salidas || 0 }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botón Nuevo Ajuste -->
              <div class="col-12 col-md-auto">
                <q-btn-dropdown
                  label="Nuevo Ajuste"
                  icon="add"
                  color="primary"
                  unelevated
                  class="full-width"
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
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filters.itemNombre"
            outlined
            label="Buscar por código o nombre de item"
            placeholder="Ingrese código o nombre..."
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
        <div class="col-12 col-md-2">
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
        <div class="col-4 col-md-1">
          <q-input
            v-model="filters.fechaDesde"
            outlined
            label="Desde"
            dense
            clearable
            type="date"
            @update:model-value="loadAjustes"
            style="background: white; border-radius: 12px;"
          >
            <template v-slot:prepend>
              <q-icon name="event" size="xs" />
            </template>
          </q-input>
        </div>
        <div class="col-4 col-md-1">
          <q-input
            v-model="filters.fechaHasta"
            outlined
            label="Hasta"
            dense
            clearable
            type="date"
            @update:model-value="loadAjustes"
            style="background: white; border-radius: 12px;"
          >
            <template v-slot:prepend>
              <q-icon name="event" size="xs" />
            </template>
          </q-input>
        </div>
        <div class="col-4 col-md-auto">
          <div class="row q-gutter-xs" style="height: 40px;">
            <q-btn
              icon="search"
              color="primary"
              unelevated
              @click="loadAjustes"
              style="border-radius: 10px; width: 40px; height: 40px;"
            >
              <q-tooltip>Buscar</q-tooltip>
            </q-btn>
            <q-btn
              icon="download"
              color="positive"
              outline
              @click="exportarExcel"
              style="border-radius: 10px; width: 40px; height: 40px;"
            >
              <q-tooltip>Excel</q-tooltip>
            </q-btn>
            <q-btn
              icon="picture_as_pdf"
              color="negative"
              outline
              @click="exportarPDF"
              style="border-radius: 10px; width: 40px; height: 40px;"
            >
              <q-tooltip>PDF</q-tooltip>
            </q-btn>
          </div>
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
          <template v-slot:body-cell-item_nombre="props">
            <q-td :props="props">
              <div>
                <div style="font-weight: 600; color: #2c3e50;">{{ props.row.item_nombre }}</div>
                <div style="font-size: 12px; color: #6b7280;">Código: {{ props.row.item_codigo }}</div>
              </div>
            </q-td>
          </template>

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
import * as XLSX from 'xlsx';

const $q = useQuasar();

const ajustes = ref<AjusteInventario[]>([]);
const loading = ref(false);
const estadisticas = ref<Estadisticas | null>(null);

const filters = ref({
  itemNombre: '',
  tipoAjuste: null as '+' | '-' | null,
  fechaDesde: '',
  fechaHasta: ''
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
    console.log('=== FRONTEND - Valores del filtro ===');
    console.log('filters.value:', JSON.stringify(filters.value, null, 2));

    // Filtrar valores vacíos
    const cleanFilters: any = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage
    };

    if (filters.value.itemNombre?.trim()) {
      cleanFilters.itemNombre = filters.value.itemNombre.trim();
    }
    if (filters.value.tipoAjuste) {
      cleanFilters.tipoAjuste = filters.value.tipoAjuste;
    }
    if (filters.value.fechaDesde) {
      cleanFilters.fechaDesde = filters.value.fechaDesde;
      console.log('fechaDesde agregado:', filters.value.fechaDesde);
    }
    if (filters.value.fechaHasta) {
      cleanFilters.fechaHasta = filters.value.fechaHasta;
      console.log('fechaHasta agregado:', filters.value.fechaHasta);
    }

    console.log('Filtros a enviar:', JSON.stringify(cleanFilters, null, 2));

    const response = await ajustesInventarioService.getAjustes(cleanFilters);

    console.log('Respuesta recibida - Total:', response.total, 'Registros:', response.data.length);

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

const exportarExcel = () => {
  try {
    // Preparar datos para exportar
    const datosExportar = ajustes.value.map(ajuste => ({
      'Fecha': formatDate(ajuste.fecha),
      'Código Item': ajuste.item_codigo,
      'Item': ajuste.item_nombre,
      'Tipo': ajuste.tipo_ajuste === '+' ? 'Entrada (+)' : ajuste.tipo_ajuste === '-' ? 'Salida (-)' : 'Inventario Inicial',
      'Cantidad': ajuste.cantidad,
      'Inventario Anterior': ajuste.inventario_anterior,
      'Inventario Nuevo': ajuste.inventario_nuevo,
      'Motivo': ajuste.motivo || '',
      'Usuario': ajuste.usuario
    }));

    // Crear libro de trabajo XLSX
    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ajustes de Inventario');

    // Ajustar ancho de columnas
    const maxWidth = datosExportar.reduce((w: any, r: any) => {
      return Object.keys(r).map((key, i) => {
        const value = r[key] ? r[key].toString() : '';
        return Math.max(w[i] || 10, Math.min(value.length, 50));
      });
    }, []);
    worksheet['!cols'] = maxWidth.map((w: number) => ({ wch: w + 2 }));

    // Descargar archivo
    XLSX.writeFile(workbook, `ajustes-inventario-${new Date().toISOString().split('T')[0]}.xlsx`);

    $q.notify({
      type: 'positive',
      message: 'Archivo Excel exportado correctamente',
      position: 'top'
    });
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a Excel: ' + error.message,
      position: 'top'
    });
  }
};

const exportarPDF = () => {
  try {
    // Crear contenido HTML para el PDF
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ajustes de Inventario</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2c3e50; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { background-color: #3b82f6; color: white; padding: 8px; text-align: left; border: 1px solid #ddd; }
            td { padding: 6px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .entrada { color: #10b981; font-weight: bold; }
            .salida { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Ajustes de Inventario</h1>
          <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Código</th>
                <th>Item</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Inv. Anterior</th>
                <th>Inv. Nuevo</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              ${ajustes.value.map(ajuste => `
                <tr>
                  <td>${formatDate(ajuste.fecha)}</td>
                  <td>${ajuste.item_codigo}</td>
                  <td>${ajuste.item_nombre}</td>
                  <td class="${ajuste.tipo_ajuste === '+' ? 'entrada' : 'salida'}">${ajuste.tipo_ajuste === '+' ? 'Entrada (+)' : ajuste.tipo_ajuste === '-' ? 'Salida (-)' : 'Inicial'}</td>
                  <td>${ajuste.cantidad}</td>
                  <td>${ajuste.inventario_anterior}</td>
                  <td>${ajuste.inventario_nuevo}</td>
                  <td>${ajuste.motivo || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Abrir ventana nueva con el contenido para imprimir
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenidoHTML);
      ventana.document.close();

      // Esperar a que cargue y luego abrir el diálogo de impresión
      ventana.onload = () => {
        ventana.print();
      };

      $q.notify({
        type: 'positive',
        message: 'PDF generado. Use Ctrl+P para guardar como PDF',
        position: 'top'
      });
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a PDF: ' + error.message,
      position: 'top'
    });
  }
};

onMounted(() => {
  loadAjustes();
  loadEstadisticas();
});
</script>

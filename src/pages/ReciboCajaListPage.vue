<template>
  <q-page padding>
    <div style="max-width: 1800px; margin: 0 auto;">
      <!-- Encabezado -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h4 style="margin: 0; font-weight: 700; color: #1f2937;">Recibos de Caja</h4>
        <div style="display: flex; gap: 12px;">
          <q-btn
            @click="exportToExcel"
            color="green-7"
            icon="description"
            label="Exportar Excel"
            unelevated
            :loading="exporting"
          />
          <q-btn
            @click="exportToPDF"
            color="red-7"
            icon="picture_as_pdf"
            label="Exportar PDF"
            unelevated
            :loading="exporting"
          />
        </div>
      </div>

      <!-- Tabla -->
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <q-table
          :rows="recibos"
          :columns="columns"
          row-key="codigo"
          :loading="loading"
          flat
          v-model:pagination="pagination"
          @request="onRequest"
          :rows-per-page-options="[10, 15, 20, 25]"
          rows-per-page-label="Registros por página:"
          :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) =>
            `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`"
          no-data-label="No hay datos disponibles"
          no-results-label="No se encontraron resultados"
          loading-label="Cargando..."
        >
          <!-- Header con filtros -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                <!-- Label del header con altura fija -->
                <div style="height: 24px; display: flex; align-items: center; margin-bottom: 8px; font-weight: 600;">
                  {{ col.label }}
                </div>

                <!-- Contenedor de filtros con altura mínima -->
                <div style="min-height: 32px;">
                  <!-- Filtros por columna -->
                  <div v-if="col.name === 'fecha'" style="display: flex; gap: 4px; flex-direction: column;">
                    <q-input
                      v-model="filters.fecha_desde"
                      dense
                      debounce="500"
                      type="date"
                      placeholder="Desde"
                      clearable
                      @update:model-value="loadRecibos"
                      style="min-width: 120px; font-size: 11px;"
                    />
                    <q-input
                      v-model="filters.fecha_hasta"
                      dense
                      debounce="500"
                      type="date"
                      placeholder="Hasta"
                      clearable
                      @update:model-value="loadRecibos"
                      style="min-width: 120px; font-size: 11px;"
                    />
                  </div>

                  <div v-else-if="col.name === 'codigo'">
                    <q-input
                      v-model="filters.codigo"
                      dense
                      debounce="500"
                      placeholder="Filtrar..."
                      clearable
                      @update:model-value="loadRecibos"
                      style="min-width: 80px;"
                    >
                      <template v-slot:append>
                        <q-icon name="search" size="xs" />
                      </template>
                    </q-input>
                  </div>

                  <div v-else-if="col.name === 'instalacion_codigo'">
                    <q-input
                      v-model="filters.instalacion_codigo"
                      dense
                      debounce="500"
                      placeholder="Filtrar..."
                      clearable
                      @update:model-value="loadRecibos"
                      style="min-width: 100px;"
                    >
                      <template v-slot:append>
                        <q-icon name="search" size="xs" />
                      </template>
                    </q-input>
                  </div>

                  <div v-else-if="col.name === 'nombre'">
                    <q-input
                      v-model="filters.nombre"
                      dense
                      debounce="500"
                      placeholder="Filtrar..."
                      clearable
                      @update:model-value="loadRecibos"
                      style="min-width: 150px;"
                    >
                      <template v-slot:append>
                        <q-icon name="search" size="xs" />
                      </template>
                    </q-input>
                  </div>

                  <div v-else-if="col.name === 'factura'">
                    <q-input
                      v-model="filters.factura"
                      dense
                      debounce="500"
                      placeholder="Filtrar..."
                      clearable
                      @update:model-value="loadRecibos"
                      style="min-width: 100px;"
                    >
                      <template v-slot:append>
                        <q-icon name="search" size="xs" />
                      </template>
                    </q-input>
                  </div>

                  <div v-else-if="col.name === 'documento'">
                    <q-input
                      v-model="filters.documento"
                      dense
                      debounce="500"
                      placeholder="Filtrar..."
                      clearable
                      @update:model-value="loadRecibos"
                      style="min-width: 100px;"
                    >
                      <template v-slot:append>
                        <q-icon name="search" size="xs" />
                      </template>
                    </q-input>
                  </div>

                  <div v-else-if="col.name === 'n_tipo'">
                    <q-input
                      v-model="filters.n_tipo"
                      dense
                      debounce="500"
                      placeholder="Filtrar..."
                      clearable
                      @update:model-value="loadRecibos"
                      style="min-width: 120px;"
                    >
                      <template v-slot:append>
                        <q-icon name="search" size="xs" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-th>
            </q-tr>
          </template>

          <!-- Columna de acciones -->
          <template v-slot:body-cell-anular="props">
            <q-td :props="props">
              <q-btn
                v-if="!isAnulado(props.row.anulado)"
                flat
                dense
                round
                icon="cancel"
                size="sm"
                color="red-7"
                @click.stop="anularRecibo(props.row)"
              >
                <q-tooltip>Anular</q-tooltip>
              </q-btn>
              <q-chip v-else dense color="grey-4" text-color="grey-8" size="sm">
                Anulado
              </q-chip>
            </q-td>
          </template>

          <!-- Columna fecha con formato -->
          <template v-slot:body-cell-fecha="props">
            <q-td :props="props">
              {{ formatDate(props.row.fecha) }}
            </q-td>
          </template>

          <!-- Columna valor con formato moneda -->
          <template v-slot:body-cell-valor="props">
            <q-td :props="props">
              <div style="font-weight: 600; color: #10b981;">
                ${{ formatNumber(props.row.valor) }}
              </div>
            </q-td>
          </template>

          <!-- Columna valor_nota con formato moneda -->
          <template v-slot:body-cell-valor_nota="props">
            <q-td :props="props">
              <div v-if="props.row.valor_nota" style="font-weight: 500;">
                ${{ formatNumber(props.row.valor_nota) }}
              </div>
              <div v-else style="color: #9ca3af;">-</div>
            </q-td>
          </template>

          <!-- Columna anulado con chip -->
          <template v-slot:body-cell-anulado_estado="props">
            <q-td :props="props">
              <q-chip
                :color="isAnulado(props.row.anulado) ? 'red' : 'green'"
                text-color="white"
                dense
                size="sm"
              >
                {{ isAnulado(props.row.anulado) ? 'Sí' : 'No' }}
              </q-chip>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { recibosCajaService, type ReciboCaja } from '../services/api/recibos-caja.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const $q = useQuasar();

const recibos = ref<ReciboCaja[]>([]);
const loading = ref(false);
const exporting = ref(false);

const filters = ref({
  fecha_desde: '',
  fecha_hasta: '',
  codigo: '',
  instalacion_codigo: '',
  nombre: '',
  factura: '',
  documento: '',
  n_tipo: ''
});

const pagination = ref({
  sortBy: 'codigo',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  { name: 'anular', label: 'Anular', field: '', align: 'center' as const, style: 'width: 80px' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' as const, sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center' as const, sortable: true },
  { name: 'instalacion_codigo', label: 'Instalación', field: 'instalacion_codigo', align: 'center' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'right' as const, sortable: true },
  { name: 'factura', label: 'Factura', field: 'factura', align: 'left' as const },
  { name: 'anulado_estado', label: 'Anulado', field: 'anulado', align: 'center' as const },
  { name: 'descripcion', label: 'Forma Pago', field: 'descripcion', align: 'left' as const },
  { name: 'documento', label: 'Documento', field: 'documento', align: 'left' as const },
  { name: 'valor_nota', label: 'Valor Nota', field: 'valor_nota', align: 'right' as const },
  { name: 'nro_nota', label: 'Nro Nota', field: 'nro_nota', align: 'left' as const },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'left' as const },
  { name: 'n_tipo', label: 'Tipo Recibo', field: 'n_tipo', align: 'left' as const }
];

const loadRecibos = async () => {
  try {
    loading.value = true;
    const response = await recibosCajaService.getRecibos({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      ...filters.value
    });

    recibos.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar recibos: ' + error.message,
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const onRequest = (props: any) => {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  pagination.value.sortBy = props.pagination.sortBy;
  pagination.value.descending = props.pagination.descending;
  loadRecibos();
};

const anularRecibo = (recibo: ReciboCaja) => {
  $q.dialog({
    title: '<div style="display: flex; align-items: center; gap: 12px; color: #dc2626;"><span class="material-icons" style="font-size: 32px;">warning</span><span style="font-size: 18px; font-weight: 600;">Confirmar Anulación</span></div>',
    message: `
      <div style="padding: 16px 0;">
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151;">
          ¿Está seguro de anular el siguiente recibo de caja?
        </p>
        <div style="background: linear-gradient(135deg, #fef3f2 0%, #fee2e2 100%); border-left: 4px solid #dc2626; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="material-icons" style="color: #dc2626; font-size: 20px;">person</span>
              <div>
                <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Cliente</div>
                <div style="font-size: 14px; color: #1f2937; font-weight: 500;">${recibo.nombre}</div>
              </div>
            </div>
            <div style="display: flex; gap: 24px;">
              <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                <span class="material-icons" style="color: #dc2626; font-size: 20px;">receipt</span>
                <div>
                  <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Factura</div>
                  <div style="font-size: 14px; color: #1f2937; font-weight: 500;">${recibo.factura}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                <span class="material-icons" style="color: #dc2626; font-size: 20px;">attach_money</span>
                <div>
                  <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Valor</div>
                  <div style="font-size: 16px; color: #dc2626; font-weight: 700;">$${formatNumber(recibo.valor)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p style="margin: 16px 0 0 0; font-size: 13px; color: #dc2626; font-weight: 500; display: flex; align-items: center; gap: 6px;">
          <span class="material-icons" style="font-size: 18px;">info</span>
          Esta acción no se puede deshacer
        </p>
      </div>
    `,
    html: true,
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true,
      noCaps: true,
      style: 'padding: 8px 20px; border-radius: 8px;'
    },
    ok: {
      label: 'Sí, Anular Recibo',
      color: 'red',
      unelevated: true,
      noCaps: true,
      style: 'padding: 8px 20px; border-radius: 8px; font-weight: 600;'
    },
    persistent: true,
    style: 'min-width: 500px;'
  }).onOk(async () => {
    try {
      loading.value = true;
      const response = await recibosCajaService.anularRecibo(recibo.id);

      $q.notify({
        type: 'positive',
        message: response.message || 'Recibo anulado exitosamente',
        position: 'top'
      });

      // Recargar la lista
      await loadRecibos();
    } catch (error: any) {
      $q.notify({
        type: 'negative',
        message: 'Error al anular el recibo: ' + error.message,
        position: 'top'
      });
    } finally {
      loading.value = false;
    }
  });
};

const formatNumber = (value: number) => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('es-CO').format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const isAnulado = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'si' || lower === 'sí' || lower === 'true' || lower === '1';
  }
  return false;
};

const exportToExcel = async () => {
  try {
    exporting.value = true;

    // Preparar datos para exportar
    const dataToExport = recibos.value.map(recibo => ({
      'Código': recibo.codigo,
      'Fecha': formatDate(recibo.fecha),
      'Instalación': recibo.instalacion_codigo,
      'Nombre': recibo.nombre,
      'Valor': recibo.valor,
      'Factura': recibo.factura,
      'Anulado': isAnulado(recibo.anulado) ? 'Sí' : 'No',
      'Forma Pago': recibo.descripcion,
      'Documento': recibo.documento,
      'Valor Nota': recibo.valor_nota || '',
      'Nro Nota': recibo.nro_nota || '',
      'Observación': recibo.observacion || '',
      'Tipo Recibo': recibo.n_tipo
    }));

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recibos de Caja');

    // Ajustar ancho de columnas
    const maxWidth = 50;
    const colWidths = Object.keys(dataToExport[0] || {}).map(key => ({
      wch: Math.min(Math.max(key.length, 10), maxWidth)
    }));
    ws['!cols'] = colWidths;

    // Guardar archivo
    const fileName = `recibos_caja_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    $q.notify({
      type: 'positive',
      message: 'Archivo Excel exportado exitosamente',
      position: 'top'
    });
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a Excel: ' + error.message,
      position: 'top'
    });
  } finally {
    exporting.value = false;
  }
};

const exportToPDF = async () => {
  try {
    exporting.value = true;

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation

    // Título
    doc.setFontSize(16);
    doc.text('Recibos de Caja', 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = recibos.value.map(recibo => [
      recibo.codigo,
      formatDate(recibo.fecha),
      recibo.instalacion_codigo,
      recibo.nombre,
      `$${formatNumber(recibo.valor)}`,
      recibo.factura,
      isAnulado(recibo.anulado) ? 'Sí' : 'No',
      recibo.descripcion,
      recibo.documento || '',
      recibo.n_tipo
    ]);

    // Generar tabla
    autoTable(doc, {
      head: [['Código', 'Fecha', 'Instalación', 'Nombre', 'Valor', 'Factura', 'Anulado', 'Forma Pago', 'Documento', 'Tipo']],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 28 }
    });

    // Guardar PDF
    const fileName = `recibos_caja_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    $q.notify({
      type: 'positive',
      message: 'Archivo PDF exportado exitosamente',
      position: 'top'
    });
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a PDF: ' + error.message,
      position: 'top'
    });
  } finally {
    exporting.value = false;
  }
};

onMounted(() => {
  loadRecibos();
});
</script>

<style scoped>
.q-table th {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}
</style>

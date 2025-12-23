<template>
  <q-page style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
    <div class="q-pa-md">
      <!-- Header -->
     

      <!-- Filtros -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6 col-md-2">
          <q-select
            v-model="filters.mes"
            outlined
            label="Mes"
            dense
            clearable
            :options="mesesOptions"
            emit-value
            map-options
            @update:model-value="loadFacturas"
            style="background: white; border-radius: 12px;"
          >
            <template v-slot:prepend>
              <q-icon name="calendar_month" size="xs" />
            </template>
          </q-select>
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="filters.year"
            outlined
            label="Año"
            dense
            clearable
            :options="yearsOptions"
            emit-value
            @update:model-value="loadFacturas"
            style="background: white; border-radius: 12px;"
          >
            <template v-slot:prepend>
              <q-icon name="event" size="xs" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-auto">
          <div class="row q-gutter-xs" style="height: 40px;">
            <q-btn
              icon="search"
              color="primary"
              unelevated
              @click="loadFacturas"
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
              <q-tooltip>Exportar a Excel</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Tabla de facturas -->
      <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
        <q-table
          :rows="facturas"
          :columns="columns"
          row-key="factura"
          :loading="loading"
          flat
          v-model:pagination="pagination"
          @request="onRequest"
          :rows-per-page-options="[20, 50, 100]"
          rows-per-page-label="Registros por página:"
          :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`"
          no-data-label="No hay datos disponibles"
          no-results-label="No se encontraron resultados"
          loading-label="Cargando..."
          style="max-height: calc(100vh - 300px);"
        >
          <!-- Headers con filtros -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                <div>{{ col.label }}</div>
                <!-- Inputs de filtro para columnas específicas -->
                <q-input
                  v-if="col.name === 'factura_completa'"
                  v-model="filters.factura"
                  dense
                  debounce="500"
                  placeholder="Filtrar..."
                  clearable
                  @update:model-value="loadFacturas"
                  class="q-mt-xs"
                  style="min-width: 100px;"
                >
                  <template v-slot:append>
                    <q-icon name="search" size="xs" />
                  </template>
                </q-input>
                <q-input
                  v-if="col.name === 'cliente'"
                  v-model="filters.nombre"
                  dense
                  debounce="500"
                  placeholder="Nombre..."
                  clearable
                  @update:model-value="loadFacturas"
                  class="q-mt-xs"
                  style="min-width: 120px;"
                >
                  <template v-slot:append>
                    <q-icon name="search" size="xs" />
                  </template>
                </q-input>
                <q-input
                  v-if="col.name === 'suscriptor_instalacion'"
                  v-model="filters.instalacion_codigo"
                  dense
                  debounce="500"
                  placeholder="Instalación..."
                  clearable
                  @update:model-value="loadFacturas"
                  class="q-mt-xs"
                  style="min-width: 100px;"
                >
                  <template v-slot:append>
                    <q-icon name="search" size="xs" />
                  </template>
                </q-input>
                <q-input
                  v-if="col.name === 'direccion' || col.name === 'ciudad_nombre' || col.name === 'sector_nombre'"
                  v-model="filters[col.name]"
                  dense
                  debounce="500"
                  placeholder="Filtrar..."
                  clearable
                  @update:model-value="loadFacturas"
                  class="q-mt-xs"
                  style="min-width: 100px;"
                >
                  <template v-slot:append>
                    <q-icon name="search" size="xs" />
                  </template>
                </q-input>
              </q-th>
            </q-tr>
          </template>

          <!-- Columna de acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="acciones-cell">
              <div class="acciones-container">
                <q-btn
                  flat
                  dense
                  round
                  icon="payment"
                  size="sm"
                  color="green-7"
                  @click.stop="pagarFactura(props.row)"
                  class="accion-btn"
                >
                  <q-tooltip>Pagar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="print"
                  size="sm"
                  color="blue-7"
                  @click.stop="imprimirFactura(props.row)"
                  class="accion-btn"
                >
                  <q-tooltip>Imprimir</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="cloud_upload"
                  size="sm"
                  color="purple-7"
                  @click.stop="enviarDian(props.row)"
                  class="accion-btn"
                >
                  <q-tooltip>Enviar DIAN</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="email"
                  size="sm"
                  color="orange-7"
                  @click.stop="enviarEmail(props.row)"
                  class="accion-btn"
                >
                  <q-tooltip>Enviar Email</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="chat"
                  size="sm"
                  color="teal-7"
                  @click.stop="enviarWhatsapp(props.row)"
                  class="accion-btn"
                >
                  <q-tooltip>Enviar WhatsApp</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- Columnas agrupadas -->
          <template v-slot:body-cell-periodo="props">
            <q-td :props="props">
              <div style="text-align: center;">
                <div style="font-weight: 600; color: #2c3e50;">{{ props.row.mes }}/{{ props.row.year }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-factura_completa="props">
            <q-td :props="props">
              <div>
                <div style="font-weight: 600; color: #2c3e50;" v-html="highlightText(props.row.prefijo, 'factura')"></div>
                <div style="font-size: 11px; color: #6b7280;" v-html="highlightText(props.row.factura, 'factura')"></div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-cliente="props">
            <q-td :props="props">
              <div>
                <div style="font-weight: 600; color: #2c3e50;" v-html="highlightText(props.row.nombre, 'nombre')"></div>
                <div style="font-size: 11px; color: #6b7280;" v-html="highlightText(props.row.ident, 'nombre')"></div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-suscriptor_instalacion="props">
            <q-td :props="props">
              <div>
                <div style="font-weight: 600; color: #2c3e50;" v-html="highlightText(props.row.suscriptor, 'instalacion')"></div>
                <div style="font-size: 11px; color: #6b7280;">Inst: <span v-html="highlightText(props.row.instalacion_codigo, 'instalacion')"></span></div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-consumo="props">
            <q-td :props="props">
              <div>{{ props.row.consumo }} m³</div>
            </q-td>
          </template>

          <template v-slot:body-cell-total_total="props">
            <q-td :props="props">
              <div style="font-weight: 600; color: #10b981;">
                ${{ formatNumber(props.row.total_total) }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-saldo="props">
            <q-td :props="props">
              <div style="font-weight: 600;" :style="{ color: props.row.saldo > 0 ? '#ef4444' : '#6b7280' }">
                ${{ formatNumber(props.row.saldo) }}
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { facturasService, type Factura } from '../services/api/facturas.service';
import { useQuasar } from 'quasar';
import * as XLSX from 'xlsx';

const $q = useQuasar();

const facturas = ref<Factura[]>([]);
const loading = ref(false);

const filters = ref({
  mes: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  factura: '',
  nombre: '',
  ident: '',
  instalacion_codigo: '',
  direccion: '',
  ciudad_nombre: '',
  sector_nombre: ''
});

const mesesOptions = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 }
];

const currentYear = new Date().getFullYear();
const yearsOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

const pagination = ref({
  sortBy: 'factura',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
});

const columns = [
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' as const, style: 'width: 50px' },
  { name: 'periodo', label: 'Periodo', field: 'mes', align: 'center' as const },
  { name: 'factura_completa', label: 'Factura', field: 'factura', align: 'left' as const, sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'suscriptor_instalacion', label: 'Suscriptor / Instalación', field: 'suscriptor', align: 'left' as const },
  { name: 'total_total', label: 'Total', field: 'total_total', align: 'right' as const },
  { name: 'saldo', label: 'Saldo', field: 'saldo', align: 'right' as const, sortable: true },
  { name: 'consumo', label: 'Consumo', field: 'consumo', align: 'center' as const, format: (val: number) => `${val} m³` },
  { name: 'estrato', label: 'Estrato', field: 'estrato', align: 'center' as const },
  { name: 'cargo_fijo', label: 'Cargo Fijo', field: 'cargo_fijo', align: 'right' as const, format: (val: number) => `$${formatNumber(val)}` },
  { name: 'basico', label: 'Básico', field: 'basico', align: 'right' as const, format: (val: number) => formatNumber(val) },
  { name: 'complementario', label: 'Complementario', field: 'complementario', align: 'right' as const, format: (val: number) => formatNumber(val) },
  { name: 'suntuario', label: 'Suntuario', field: 'suntuario', align: 'right' as const, format: (val: number) => formatNumber(val) },
  { name: 'valor_subsidio_cargo_fijo', label: 'Subsidio Cargo Fijo', field: 'valor_subsidio_cargo_fijo', align: 'right' as const, format: (val: number) => `$${formatNumber(val)}` },
  { name: 'valor_subsidio_consumo', label: 'Subsidio Consumo', field: 'valor_subsidio_consumo', align: 'right' as const, format: (val: number) => `$${formatNumber(val)}` },
  { name: 'saldo_anterior', label: 'Saldo Anterior', field: 'saldo_anterior', align: 'right' as const, format: (val: number) => `$${formatNumber(val)}` },
  { name: 'total_otros_cobros', label: 'Total Otros Cobros', field: 'total_otros_cobros', align: 'right' as const, format: (val: number) => `$${formatNumber(val)}` },
  { name: 'interes', label: 'Interés', field: 'interes', align: 'right' as const, format: (val: number) => `$${formatNumber(val)}` },
  { name: 'dias_facturados', label: 'Días', field: 'dias_facturados', align: 'center' as const },
  { name: 'fecha_factura', label: 'Fecha Factura', field: 'fecha_factura', align: 'center' as const, format: (val: string) => formatDate(val) },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' as const },
  { name: 'uso_nombre', label: 'Uso', field: 'uso_nombre', align: 'left' as const },
  { name: 'ciudad_nombre', label: 'Ciudad', field: 'ciudad_nombre', align: 'left' as const },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' as const },
  { name: 'sector_nombre', label: 'Sector', field: 'sector_nombre', align: 'left' as const },
  { name: 'codigo_medidor', label: 'Código Medidor', field: 'codigo_medidor', align: 'left' as const },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center' as const, format: (val: string) => formatDate(val) }
];

const loadFacturas = async () => {
  loading.value = true;
  try {
    const cleanFilters: any = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage
    };

    if (filters.value.mes) {
      cleanFilters.mes = filters.value.mes;
    }
    if (filters.value.year) {
      cleanFilters.year = filters.value.year;
    }
    if (filters.value.factura?.trim()) {
      cleanFilters.factura = filters.value.factura.trim();
    }
    if (filters.value.nombre?.trim()) {
      cleanFilters.nombre = filters.value.nombre.trim();
    }
    if (filters.value.ident?.trim()) {
      cleanFilters.ident = filters.value.ident.trim();
    }
    if (filters.value.instalacion_codigo?.trim()) {
      cleanFilters.instalacion_codigo = filters.value.instalacion_codigo.trim();
    }
    if (filters.value.direccion?.trim()) {
      cleanFilters.direccion = filters.value.direccion.trim();
    }
    if (filters.value.ciudad_nombre?.trim()) {
      cleanFilters.ciudad_nombre = filters.value.ciudad_nombre.trim();
    }
    if (filters.value.sector_nombre?.trim()) {
      cleanFilters.sector_nombre = filters.value.sector_nombre.trim();
    }

    const response = await facturasService.getFacturas(cleanFilters);

    facturas.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al cargar facturas',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const onRequest = (props: any) => {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  loadFacturas();
};

const formatNumber = (value: number) => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('es-CO').format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const highlightText = (text: string | number, fieldName: string): string => {
  if (!text && text !== 0) return '';
  const textStr = String(text);

  // Obtener el valor del filtro correspondiente
  let searchTerm = '';
  if (fieldName === 'factura') searchTerm = filters.value.factura?.trim() || '';
  else if (fieldName === 'nombre') searchTerm = filters.value.nombre?.trim() || '';
  else if (fieldName === 'instalacion') searchTerm = filters.value.instalacion_codigo?.trim() || '';
  else if (fieldName === 'ident') searchTerm = filters.value.ident?.trim() || '';
  else if (fieldName === 'year') searchTerm = filters.value.year ? String(filters.value.year) : '';

  if (!searchTerm) return textStr;

  // Escapar caracteres especiales en el término de búsqueda
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');

  return textStr.replace(regex, '<span style="color: #2563eb; font-weight: 600;">$1</span>');
};

// Funciones de acciones
const pagarFactura = (factura: Factura) => {
  console.log('Pagar factura:', factura);
  $q.notify({
    type: 'info',
    message: `Función pagar - Factura ${factura.prefijo}-${factura.factura}`,
    position: 'top'
  });
};

const imprimirFactura = (factura: Factura) => {
  console.log('Imprimir factura:', factura);
  $q.notify({
    type: 'info',
    message: `Función imprimir - Factura ${factura.prefijo}-${factura.factura}`,
    position: 'top'
  });
};

const enviarDian = (factura: Factura) => {
  console.log('Enviar a DIAN:', factura);
  $q.notify({
    type: 'info',
    message: `Función enviar DIAN - Factura ${factura.prefijo}-${factura.factura}`,
    position: 'top'
  });
};

const enviarEmail = (factura: Factura) => {
  console.log('Enviar email:', factura);
  $q.notify({
    type: 'info',
    message: `Función enviar email - Factura ${factura.prefijo}-${factura.factura}`,
    position: 'top'
  });
};

const enviarWhatsapp = (factura: Factura) => {
  console.log('Enviar WhatsApp:', factura);
  $q.notify({
    type: 'info',
    message: `Función enviar WhatsApp - Factura ${factura.prefijo}-${factura.factura}`,
    position: 'top'
  });
};

const exportarExcel = async () => {
  try {
    loading.value = true;

    // Obtener TODOS los registros con los filtros aplicados
    const response = await facturasService.getFacturas({
      ...filters.value,
      page: 1,
      limit: 0 // 0 significa traer todos los registros
    });

    const datosExportar = response.data.map(factura => ({
      'Mes': factura.mes,
      'Año': factura.year,
      'Prefijo': factura.prefijo,
      'Factura': factura.factura,
      'Nombre': factura.nombre,
      'Identificación': factura.ident,
      'Suscriptor': factura.suscriptor,
      'Instalación': factura.instalacion_codigo,
      'Consumo': factura.consumo,
      'Estrato': factura.estrato,
      'Cargo Fijo': factura.cargo_fijo,
      'Básico': factura.basico,
      'Complementario': factura.complementario,
      'Suntuario': factura.suntuario,
      'Valor Subsidio Cargo Fijo': factura.valor_subsidio_cargo_fijo,
      'Valor Subsidio Consumo': factura.valor_subsidio_consumo,
      'Saldo Anterior': factura.saldo_anterior,
      'Total Otros Cobros': factura.total_otros_cobros,
      'Total Total': factura.total_total,
      'Interés': factura.interes,
      'Valor Sub Complementario': factura.valor_sub_complementario,
      'Valor Sub Suntuario': factura.valor_sub_suntuario,
      'Capital Saldo Anterior': factura.capital_saldo_anterior,
      'Interés Capital Saldo Anterior': factura.interes_capital_saldo_anterior,
      'Interés Pago Extemporáneo': factura.interes_pago_extemporaneo,
      'Cuota Conexión': factura.cuota_conexion,
      'Cuota Medidor': factura.cuota_medidor,
      'Valor Total': factura.valor_total,
      'Saldo': factura.saldo,
      'Valor Básico': factura.valor_basico,
      'Valor Complementario': factura.valor_complementario,
      'Valor Suntuario': factura.valor_suntuario,
      'Cuentas Vencidas': factura.cuentas_vencidas,
      'Otros Cobros': factura.otros_cobros,
      'Subsidio Cargo Fijo': factura.subsidio_cargo_fijo,
      'Subsidio Consumo': factura.subsidio_consumo,
      'Interés Medidor': factura.interes_medidor,
      'Interés Conexión': factura.interes_conexion,
      'Lectura': factura.lectura,
      'Saldo Conexión': factura.saldo_conexion,
      'Saldo Medidor': factura.saldo_medidor,
      'Cuota Diferido': factura.cuota_diferido,
      'Saldo Diferido': factura.saldo_diferido,
      'Reconexión': factura.reconexion,
      'Valor Metros': factura.valor_metros,
      'Total Agua': factura.total_agua,
      'Total Neto': factura.total_neto,
      'Sin Recargo': factura.sin_recargo,
      'Con Recargo': factura.con_recargo,
      'Consumo Desde': factura.consumo_desde,
      'Consumo Hasta': factura.consumo_hasta,
      'Días Facturados': factura.dias_facturados,
      'Fecha Factura': formatDate(factura.fecha_factura),
      'Lectura Anterior': factura.lec_ant,
      'Nota Cuentas Vencidas': factura.nota_cuentas_vencidas,
      'Total Mes': factura.total_mes,
      'Email': factura.email,
      'Ajuste a Centenas': factura.ajuste_a_centenas,
      'Teléfono': factura.telefono,
      'Uso': factura.uso_nombre,
      'Ciudad': factura.ciudad_nombre,
      'Dirección': factura.direccion,
      'Sector': factura.sector_nombre,
      'Código Medidor': factura.codigo_medidor,
      'Fecha': formatDate(factura.fecha)
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturas');

    const mesNombre = mesesOptions.find(m => m.value === filters.value.mes)?.label || 'Todos';
    XLSX.writeFile(workbook, `facturas-${mesNombre}-${filters.value.year}.xlsx`);

    $q.notify({
      type: 'positive',
      message: `Archivo Excel exportado correctamente (${response.total} registros)`,
      position: 'top'
    });
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a Excel: ' + error.message,
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadFacturas();
});
</script>

<style scoped>
/* Columna de acciones */
.acciones-cell {
  padding: 4px 8px !important;
  width: 50px;
}

.acciones-container {
  display: flex;
  gap: 0px;
  align-items: center;
  justify-content: center;
  opacity: 1;
}

.accion-btn {
  min-width: 24px;
  min-height: 24px;
  padding: 2px;
}

.accion-btn:hover {
  transform: scale(1.4);
  transition: transform 0.2s ease;
  z-index: 10;
}
</style>

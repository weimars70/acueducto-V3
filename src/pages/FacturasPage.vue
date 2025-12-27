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
              label="Buscar"
              @click="loadFacturas"
             
            >
              <q-tooltip>Buscar</q-tooltip>
            </q-btn>
            <q-btn
              icon="download"
              color="positive"
              outline
              label="Exportar a Excel"
              @click="exportarExcel"
              
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
          :rows-per-page-options="[15, 20, 25]"
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
                  icon="payments"
                  size="sm"
                  color="green-7"
                  @click.stop="pagarFactura(props.row)"
                  :disable="props.row.saldo <= 0"
                  class="accion-btn"
                >
                  <q-tooltip>{{ props.row.saldo <= 0 ? 'Factura ya pagada' : 'Pagar Factura' }}</q-tooltip>
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
                  color="red-7"
                  @click.stop="enviarEmail(props.row)"
                  class="accion-btn"
                >
                  <q-tooltip>Enviar Email</q-tooltip>
                </q-btn>
                <q-btn
                  unelevated
                  dense
                  round
                  size="sm"
                  @click.stop="enviarWhatsapp(props.row)"
                  class="accion-btn"
                >
                  <q-icon name="fab fa-whatsapp" color="green" />
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
import { useRouter } from 'vue-router';
import { facturasService, type Factura } from '../services/api/facturas.service';
import { whatsappService } from '../services/api/whatsapp.service';
import { emailService } from '../services/api/email.service';
import { dianService } from '../services/api/dian.service';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

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
  rowsPerPage: 10,
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
      position: 'center'
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
  router.push({
    path: '/recibo-caja',
    query: {
      instalacion: factura.instalacion_codigo.toString(),
      nombre: factura.nombre,
      factura: `${factura.prefijo}-${factura.factura}`,
      valor: factura.total_total.toString()
    }
  });
};

const imprimirFactura = async (factura: Factura) => {
  try {
    $q.loading.show({ message: 'Generando PDF...' });

    // 1. Obtener datos de la empresa
    // 1. Obtener datos de la empresa
    const empresa = await facturasService.getEmpresaInfo();
    console.log("Datos empresa:", empresa);

    // 2. Cargar el PDF base
    const existingPdfBytes = await fetch('/formato_factura_socorro.pdf').then(res => res.arrayBuffer());

    // 3. Cargar en pdf-lib
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    // Configurar fuente
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper para centrar texto en un ancho fijo
    const drawCenteredText = (text: string, x: number, y: number, w: number, font: any, size: number, color: any = rgb(0, 0, 0)) => {
        if (!text) return;
        const sanitizedText = text.replace(/[\r\n]+/g, ' ').trim();
        const textWidth = font.widthOfTextAtSize(sanitizedText, size);
        const centeredX = x + (w - textWidth) / 2;
        firstPage.drawText(sanitizedText, {
            x: centeredX,
            y,
            size,
            font,
            color,
        });
    };

    // Helper para texto multilínea centrado
    const drawMultiLineCenteredText = (text: string, x: number, y: number, w: number, font: any, size: number, color: any = rgb(0, 0, 0), lineHeight: number = 12) => {
        if (!text) return;
        const sanitizedText = text.replace(/[\r\n]+/g, ' ').trim();
        const words = sanitizedText.split(' ');
        let currentLine = '';
        let currentY = y;

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, size);
            
            if (testWidth <= w) {
                currentLine = testLine;
            } else {
                // Dibujar línea actual
                if (currentLine) {
                    const lineWidth = font.widthOfTextAtSize(currentLine, size);
                    const centeredX = x + (w - lineWidth) / 2;
                    firstPage.drawText(currentLine, { x: centeredX, y: currentY, size, font, color });
                    currentY -= lineHeight; // Bajar para la siguiente línea
                }
                currentLine = word;
            }
        }
        // Dibujar última línea
        if (currentLine) {
            const lineWidth = font.widthOfTextAtSize(currentLine, size);
            const centeredX = x + (w - lineWidth) / 2;
            firstPage.drawText(currentLine, { x: centeredX, y: currentY, size, font, color });
        }
    };

    // Helper para texto alineado a la derecha
    const drawRightAlignedText = (text: string, x: number, y: number, font: any, size: number, color: any = rgb(0, 0, 0)) => {
        if (!text) return;
        const width = font.widthOfTextAtSize(text, size);
        firstPage.drawText(text, {
            x: x - width,
            y,
            size,
            font,
            color,
        });
    };

    // Helper para dibujar fila de factura con alineación correcta
    const drawInvoiceRow = (y: number, label: string, info: string, val1: number, val2: number, val3: number, total: number, saldo: number) => {
        // Columna 1: Label (Left 16)
        firstPage.drawText(label, { x: 16, y, size: 8, font: helveticaBold });
        
        // Columna 2: Info (Left 170)
        firstPage.drawText(info, { x: 170, y, size: 8, font: helveticaBold });
        
        // Columna 3: Val 1 (Right align at ~300)
        drawRightAlignedText(`$ ${formatNumber(val1)}`, 275, y, helveticaBold, 8);

        // Columna 4: Val 2 (Right align at ~440)
        drawRightAlignedText(`$ ${formatNumber(val2)}`, 340, y, helveticaBold, 8);

        // Columna 5: Val 3 (Right align at ~505)
        drawRightAlignedText(`$ ${formatNumber(val3)}`, 480, y, helveticaBold, 8);

        // Columna 6: Total (Right align at ~590)
        drawRightAlignedText(`$ ${formatNumber(total)}`, 545, y, helveticaBold, 8);

        // Columna 7: Saldo (Right align at ~650)
        if (saldo > 0) {
            drawRightAlignedText(`$ ${formatNumber(saldo)}`, 596, y, helveticaBold, 8);
        }
    };

    // Helper para dibujar una sección de la factura (mitad superior o inferior)
    const drawInvoiceSection = (baseY: number) => {
        // 4. Escribir datos de la empresa (Ajustar coordenadas según plantilla)
        // Definir el cuadro donde se centrará el texto (X inicial y Ancho)
        const headerBoxX = 50; 
        const headerBoxWidth = 300; // Ancho fijo para centrar

        // Nombre Empresa
        drawCenteredText(empresa.nombre || '', headerBoxX, baseY - 25, headerBoxWidth, helveticaBold, 13);

        // NIT
        drawCenteredText(`NIT: ${empresa.ident || ''} Tel: ${empresa.telefono || ''}`, headerBoxX, baseY - 37, headerBoxWidth, helveticaFont, 10);

        // Dirección
        drawCenteredText(empresa.direccion || '', headerBoxX, baseY - 47, headerBoxWidth, helveticaFont, 10);
        
        // Descripción (Multilínea)
        // Ajuste específico para la descripción: más a la derecha y menos ancho
        const descriptionBoxX = headerBoxX + 60; 
        const descriptionBoxWidth = headerBoxWidth - 120;
        drawMultiLineCenteredText(empresa.descripcion || '', descriptionBoxX, baseY - 57, descriptionBoxWidth, helveticaFont, 10);

        // Datos de la factura
        firstPage.drawText(`${factura.prefijo}-${factura.factura}`, {
            x: 427,
            y: baseY - 35,
            size: 6,
            font: helveticaBold,
            color: rgb(1, 0, 0) // Rojo para destacar
        });

        firstPage.drawText(`${factura.instalacion_codigo}`, {
            x: 555,
            y: baseY - 35,
            size: 8,
            font: helveticaBold,
            color: rgb(1, 0, 0) // Rojo para destacar
        });

        drawCenteredText(`${factura.mes_nombre} de ${factura.year}`, 300, baseY - 65, 200, helveticaBold, 8);
        drawCenteredText(`FACTURA DE SERVICIOS PUBLICOS: ${factura.factura}`, 300, baseY - 77, 200, helveticaBold, 7);

        drawMultiLineCenteredText(` ${factura.nota_cuentas_vencidas}`, 505, baseY - 60, 95, helveticaBold, 6, rgb(1, 0, 0));

        drawMultiLineCenteredText(` $ ${formatNumber(factura.saldo)}`, 480, baseY - 106, 100, helveticaBold, 15, rgb(0, 0, 1));
        
        firstPage.drawText(` ${factura.nombre} CC: ${factura.ident} Dirección: ${factura.direccion} Teléfono: ${factura.telefono}`, {
            x: 30,
            y: baseY - 146,
            size: 8,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });
        
        firstPage.drawText(` Estrato: ${factura.estrato} Medidor: ${factura.codigo_medidor} Uso: ${factura.uso_nombre} Sector: ${factura.sector_nombre}`, {
            x: 30,
            y: baseY - 163,
            size: 8,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText(` Consumo del ${formatDate(String(factura.consumo_desde))} al ${formatDate(String(factura.consumo_hasta))} del mes de ${factura.mes_nombre} año  ${factura.year}`, {
            x: 95,
            y: baseY - 189,
            size: 8,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });

         firstPage.drawText(` Sin recargo: ${formatDate(String(factura.sin_recargo))}               Con recargo: ${formatDate(String(factura.con_recargo))}             Lectura Actual: ${factura.lectura}                Lectura Anterior: ${factura.lec_ant}                Consumo M3: ${factura.consumo}`, {
            x: 16,
            y: baseY - 205,
            size: 8,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });

        let currentY = baseY - 240;
        const rowHeight = 10;

        if (Number(factura.cargo_fijo) > 0) {
            drawInvoiceRow(
                currentY,
                "Cargo Fijo ",
                "1 Mes",
                factura.cargo_fijo,
                factura.cargo_fijo,
                factura.valor_subsidio_cargo_fijo,
                Number(factura.cargo_fijo) + Number(factura.valor_subsidio_cargo_fijo),
                0
            );
            currentY -= rowHeight;
        }
        if (Number(factura.valor_basico) > 0) {
            drawInvoiceRow(
                currentY,
                "Consumo Basico ",
                "1 Mes",
                factura.v_u_basico ?? 0,
                factura.valor_basico,
                factura.valor_subsidio_consumo,
                Number(factura.valor_basico) + Number(factura.valor_subsidio_consumo),
                0
            );
            currentY -= rowHeight;
        }
        if (Number(factura.valor_complementario) > 0) {
            drawInvoiceRow(
                currentY,
                "Consumo Complemetario",
                `${factura.complementario} M3`,
                factura.v_u_complementario ?? 0,
                factura.valor_complementario,
                factura.valor_sub_complementario,
                Number(factura.valor_complementario) + Number(factura.valor_sub_complementario),
                0
            );
            currentY -= rowHeight;
        }

         if (Number(factura.valor_suntuario) > 0) {
            drawInvoiceRow(
                currentY,
                "Consumo Suntuario",
                `${factura.suntuario} M3`,
                factura.v_u_suntuario ?? 0,
                factura.valor_suntuario,
                factura.valor_sub_suntuario,
                Number(factura.valor_suntuario) + Number(factura.valor_sub_suntuario),
                0
            );
            currentY -= rowHeight;
        }
        
         if (Number(factura.cuota_conexion) > 0) {
            drawInvoiceRow(
                currentY,
                "Cuota de Conexión",
                `1`,
                factura.cuota_conexion ?? 0,
                factura.cuota_conexion,
                0,
                Number(factura.cuota_conexion),
                Number(factura.saldo_conexion),
            );
            currentY -= rowHeight;
        }

         if (Number(factura.cuota_medidor) > 0) {
            drawInvoiceRow(
                currentY,
                "Cuota de Medidor",
                `1`,
                factura.cuota_medidor ?? 0,
                factura.cuota_medidor,
                0,
                Number(factura.cuota_medidor),
                Number(factura.saldo_medidor),
            );
            currentY -= rowHeight;
        }
         if (Number(factura.cuota_diferido) > 0) {
            drawInvoiceRow(
                currentY,
                "Cuota Diferida",
                `1`,
                factura.cuota_diferido ?? 0,
                factura.cuota_diferido,
                0,
                Number(factura.cuota_diferido),
                Number(factura.saldo_diferido),
            );
            currentY -= rowHeight;
        }
        drawMultiLineCenteredText(` $${formatNumber(factura.total_total)}`, 470, baseY - 364, 100, helveticaBold, 12, rgb(1, 1, 1));

        
        
        if (Number(factura.interes) > 0) {
            drawInvoiceRow(
                currentY,
                "Interes por Mora",
                `1`,
                factura.interes ?? 0,
                factura.interes,
                0,
                Number(factura.interes),
                0
            );
            currentY -= rowHeight;
        }

         if (Number(factura.interes_capital_saldo_anterior) > 0) {
            drawInvoiceRow(
                currentY,
                "Interes Capital Saldo Anterior",
                `1`,
                factura.interes_capital_saldo_anterior ?? 0,
                factura.interes_capital_saldo_anterior,
                0,
                Number(factura.interes_capital_saldo_anterior),
                0
            );
            currentY -= rowHeight;
        }

         if (Number(factura.saldo_anterior) > 0) {
            drawInvoiceRow(
                currentY,
                "Saldo Anterior",
                `1`,
                factura.saldo_anterior ?? 0,
                factura.saldo_anterior,
                0,
                Number(factura.saldo_anterior),
                0
            );
            currentY -= rowHeight;
        }

        /* if (Number(factura.total_otros_cobros) > 0) {
            drawInvoiceRow(
                currentY,
                "Otros Cobros",
                `1`,
                factura.total_otros_cobros ?? 0,
                factura.total_otros_cobros,
                0,
                Number(factura.total_otros_cobros),
                0
            );
            currentY -= rowHeight;
        }*/

       

    };

    // Dibujar primera copia (arriba)
    drawInvoiceSection(height);

    // Dibujar segunda copia (abajo)
    drawInvoiceSection(height / 2.04);
    // 5. Guardar y visualizar
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

  } catch (error: any) {
    console.error("Error al imprimir factura:", error);
    $q.notify({
      type: 'negative',
      message: 'Error al generar PDF: ' + error.message,
      position: 'center'
    });
  } finally {
    $q.loading.hide();
  }
};

const enviarDian = async (factura: Factura) => {
  try {
    // Validar que tengamos empresaId
    if (!authStore.user?.empresaId) {
      $q.notify({
        type: 'negative',
        message: 'No se pudo obtener la empresa del usuario',
        position: 'center'
      });
      return;
    }

    // Confirmar antes de enviar
    $q.dialog({
      title: 'Confirmar envío a DIAN',
      message: `¿Está seguro de enviar la factura ${factura.prefijo}-${factura.factura} a la DIAN?`,
      cancel: {
        label: 'Cancelar',
        color: 'negative',
        flat: true
      },
      ok: {
        label: 'Enviar',
        color: 'primary'
      },
      persistent: true
    }).onOk(async () => {
      $q.loading.show({ message: 'Enviando factura a DIAN...' });

      try {
        const response = await dianService.enviarFacturaUnicaDian({
          empresaId: authStore.user!.empresaId,
          prefijo: factura.prefijo,
          factura: Number(factura.factura)
        });

        if (response.success) {
          $q.notify({
            type: 'positive',
            message: response.message || `Factura ${factura.prefijo}-${factura.factura} enviada exitosamente a la DIAN`,
            position: 'center',
            timeout: 5000
          });
        } else {
          $q.notify({
            type: 'warning',
            message: response.error || 'La factura se procesó pero hubo un problema',
            position: 'center',
            timeout: 5000
          });
        }
      } catch (error: any) {
        console.error('Error al enviar a DIAN:', error);
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'Error al enviar factura a DIAN',
          position: 'center',
          timeout: 5000
        });
      } finally {
        $q.loading.hide();
      }
    });
  } catch (error: any) {
    console.error('Error en enviarDian:', error);
    $q.notify({
      type: 'negative',
      message: error.message || 'Error inesperado',
      position: 'center'
    });
  }
};

const enviarEmail = async (factura: Factura) => {
  try {
    // Validar que tenga email
    if (!factura.email || factura.email.trim() === '') {
      $q.notify({
        type: 'warning',
        message: 'El cliente no tiene email registrado',
        position: 'center'
      });
      return;
    }

    $q.loading.show({ message: 'Generando factura y enviando por email...' });

    // Usar exactamente la misma lógica que enviarWhatsapp para generar el PDF
    const empresa = await facturasService.getEmpresaInfo();

    // Cargar el PDF template comprimido
    const existingPdfBytes = await fetch('/formato_factura_socorro_whatsapp.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Configurar fuente
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Copiar todos los helpers de imprimirFactura
    const drawCenteredText = (text: string, x: number, y: number, w: number, font: any, size: number, color: any = rgb(0, 0, 0)) => {
      if (!text) return;
      const sanitizedText = text.replace(/[\r\n]+/g, ' ').trim();
      const textWidth = font.widthOfTextAtSize(sanitizedText, size);
      const centeredX = x + (w - textWidth) / 2;
      firstPage.drawText(sanitizedText, { x: centeredX, y, size, font, color });
    };

    const drawMultiLineCenteredText = (text: string, x: number, y: number, w: number, font: any, size: number, color: any = rgb(0, 0, 0), lineHeight: number = 12) => {
      if (!text) return;
      const sanitizedText = text.replace(/[\r\n]+/g, ' ').trim();
      const words = sanitizedText.split(' ');
      let currentLine = '';
      let currentY = y;
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth <= w) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            const lineWidth = font.widthOfTextAtSize(currentLine, size);
            const centeredX = x + (w - lineWidth) / 2;
            firstPage.drawText(currentLine, { x: centeredX, y: currentY, size, font, color });
            currentY -= lineHeight;
          }
          currentLine = word;
        }
      }
      if (currentLine) {
        const lineWidth = font.widthOfTextAtSize(currentLine, size);
        const centeredX = x + (w - lineWidth) / 2;
        firstPage.drawText(currentLine, { x: centeredX, y: currentY, size, font, color });
      }
    };

    const drawRightAlignedText = (text: string, x: number, y: number, font: any, size: number, color: any = rgb(0, 0, 0)) => {
      if (!text) return;
      const width = font.widthOfTextAtSize(text, size);
      firstPage.drawText(text, { x: x - width, y, size, font, color });
    };

    const drawInvoiceRow = (y: number, label: string, info: string, val1: number, val2: number, val3: number, total: number, saldo: number) => {
      firstPage.drawText(label, { x: 16, y, size: 8, font: helveticaBold });
      firstPage.drawText(info, { x: 170, y, size: 8, font: helveticaBold });
      drawRightAlignedText(`$ ${formatNumber(val1)}`, 275, y, helveticaBold, 8);
      drawRightAlignedText(`$ ${formatNumber(val2)}`, 340, y, helveticaBold, 8);
      drawRightAlignedText(`$ ${formatNumber(val3)}`, 480, y, helveticaBold, 8);
      drawRightAlignedText(`$ ${formatNumber(total)}`, 545, y, helveticaBold, 8);
      if (saldo > 0) {
        drawRightAlignedText(`$ ${formatNumber(saldo)}`, 596, y, helveticaBold, 8);
      }
    };

    const drawInvoiceSection = (baseY: number) => {
      const headerBoxX = 50;
      const headerBoxWidth = 300;

      drawCenteredText(empresa.nombre || '', headerBoxX, baseY - 25, headerBoxWidth, helveticaBold, 13);
      drawCenteredText(`NIT: ${empresa.ident || ''} Tel: ${empresa.telefono || ''}`, headerBoxX, baseY - 37, headerBoxWidth, helveticaFont, 10);
      drawCenteredText(empresa.direccion || '', headerBoxX, baseY - 47, headerBoxWidth, helveticaFont, 10);

      const descriptionBoxX = headerBoxX + 60;
      const descriptionBoxWidth = headerBoxWidth - 120;
      drawMultiLineCenteredText(empresa.descripcion || '', descriptionBoxX, baseY - 57, descriptionBoxWidth, helveticaFont, 10);

      firstPage.drawText(`${factura.prefijo}-${factura.factura}`, {
        x: 427, y: baseY - 35, size: 6, font: helveticaBold, color: rgb(1, 0, 0)
      });

      firstPage.drawText(`${factura.instalacion_codigo}`, {
        x: 555, y: baseY - 35, size: 8, font: helveticaBold, color: rgb(1, 0, 0)
      });

      drawCenteredText(`${factura.mes_nombre} de ${factura.year}`, 300, baseY - 65, 200, helveticaBold, 8);
      drawCenteredText(`FACTURA DE SERVICIOS PUBLICOS: ${factura.factura}`, 300, baseY - 77, 200, helveticaBold, 7);
      drawMultiLineCenteredText(` ${factura.nota_cuentas_vencidas}`, 505, baseY - 60, 95, helveticaBold, 6, rgb(1, 0, 0));
      drawMultiLineCenteredText(` $ ${formatNumber(factura.saldo)}`, 480, baseY - 106, 100, helveticaBold, 15, rgb(0, 0, 1));

      firstPage.drawText(` ${factura.nombre} CC: ${factura.ident} Dirección: ${factura.direccion} Teléfono: ${factura.telefono}`, {
        x: 30, y: baseY - 146, size: 8, font: helveticaBold
      });

      firstPage.drawText(` Estrato: ${factura.estrato} Medidor: ${factura.codigo_medidor} Uso: ${factura.uso_nombre} Sector: ${factura.sector_nombre}`, {
        x: 30, y: baseY - 163, size: 8, font: helveticaBold
      });

      firstPage.drawText(` Consumo del ${formatDate(String(factura.consumo_desde))} al ${formatDate(String(factura.consumo_hasta))} del mes de ${factura.mes_nombre} año  ${factura.year}`, {
        x: 95, y: baseY - 189, size: 8, font: helveticaBold
      });

      firstPage.drawText(` Sin recargo: ${formatDate(String(factura.sin_recargo))}               Con recargo: ${formatDate(String(factura.con_recargo))}             Lectura Actual: ${factura.lectura}                Lectura Anterior: ${factura.lec_ant}                Consumo M3: ${factura.consumo}`, {
        x: 16, y: baseY - 205, size: 8, font: helveticaBold
      });

      let currentY = baseY - 240;
      const rowHeight = 10;

      if (Number(factura.cargo_fijo) > 0) {
        drawInvoiceRow(currentY, "Cargo Fijo ", "1 Mes", factura.cargo_fijo, factura.cargo_fijo, factura.valor_subsidio_cargo_fijo, Number(factura.cargo_fijo) + Number(factura.valor_subsidio_cargo_fijo), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.valor_basico) > 0) {
        drawInvoiceRow(currentY, "Consumo Basico ", "1 Mes", factura.v_u_basico ?? 0, factura.valor_basico, factura.valor_subsidio_consumo, Number(factura.valor_basico) + Number(factura.valor_subsidio_consumo), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.valor_complementario) > 0) {
        drawInvoiceRow(currentY, "Consumo Complemetario", `${factura.complementario} M3`, factura.v_u_complementario ?? 0, factura.valor_complementario, factura.valor_sub_complementario, Number(factura.valor_complementario) + Number(factura.valor_sub_complementario), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.valor_suntuario) > 0) {
        drawInvoiceRow(currentY, "Consumo Suntuario", `${factura.suntuario} M3`, factura.v_u_suntuario ?? 0, factura.valor_suntuario, factura.valor_sub_suntuario, Number(factura.valor_suntuario) + Number(factura.valor_sub_suntuario), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.cuota_conexion) > 0) {
        drawInvoiceRow(currentY, "Cuota de Conexión", `1`, factura.cuota_conexion ?? 0, factura.cuota_conexion, 0, Number(factura.cuota_conexion), Number(factura.saldo_conexion));
        currentY -= rowHeight;
      }
      if (Number(factura.cuota_medidor) > 0) {
        drawInvoiceRow(currentY, "Cuota de Medidor", `1`, factura.cuota_medidor ?? 0, factura.cuota_medidor, 0, Number(factura.cuota_medidor), Number(factura.saldo_medidor));
        currentY -= rowHeight;
      }
      if (Number(factura.cuota_diferido) > 0) {
        drawInvoiceRow(currentY, "Cuota Diferida", `1`, factura.cuota_diferido ?? 0, factura.cuota_diferido, 0, Number(factura.cuota_diferido), Number(factura.saldo_diferido));
        currentY -= rowHeight;
      }
      drawMultiLineCenteredText(` $${formatNumber(factura.total_total)}`, 470, baseY - 364, 100, helveticaBold, 12, rgb(1, 1, 1));

      if (Number(factura.interes) > 0) {
        drawInvoiceRow(currentY, "Interes por Mora", `1`, factura.interes ?? 0, factura.interes, 0, Number(factura.interes), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.interes_capital_saldo_anterior) > 0) {
        drawInvoiceRow(currentY, "Interes Capital Saldo Anterior", `1`, factura.interes_capital_saldo_anterior ?? 0, factura.interes_capital_saldo_anterior, 0, Number(factura.interes_capital_saldo_anterior), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.saldo_anterior) > 0) {
        drawInvoiceRow(currentY, "Saldo Anterior", `1`, factura.saldo_anterior ?? 0, factura.saldo_anterior, 0, Number(factura.saldo_anterior), 0);
        currentY -= rowHeight;
      }
    };

    // Dibujar ambas secciones
    drawInvoiceSection(height);
    drawInvoiceSection(height / 2.04);

    // Guardar y convertir a base64
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Enviar por Email
    await emailService.enviarFacturaEmail({
      emailDestinatario: factura.email,
      pdfBase64: base64,
      factura: factura.factura.toString(),
      prefijo: factura.prefijo,
      nombreCliente: factura.nombre
    });

    $q.notify({
      type: 'positive',
      message: `Factura enviada por email a ${factura.email}`,
      position: 'center'
    });

  } catch (error: any) {
    console.error('Error al enviar email:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al enviar email',
      position: 'center'
    });
  } finally {
    $q.loading.hide();
  }
};

const enviarWhatsapp = async (factura: Factura) => {
  try {
    // Validar que tenga teléfono
    if (!factura.telefono || factura.telefono.trim() === '') {
      $q.notify({
        type: 'warning',
        message: 'El cliente no tiene número de teléfono registrado',
        position: 'center'
      });
      return;
    }

    $q.loading.show({ message: 'Generando factura y enviando por WhatsApp...' });

    // Usar exactamente la misma lógica que imprimirFactura
    const empresa = await facturasService.getEmpresaInfo();

    // Cargar el PDF template comprimido para WhatsApp
    const existingPdfBytes = await fetch('/formato_factura_socorro_whatsapp.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Configurar fuente
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Copiar todos los helpers de imprimirFactura
    const drawCenteredText = (text: string, x: number, y: number, w: number, font: any, size: number, color: any = rgb(0, 0, 0)) => {
      if (!text) return;
      const sanitizedText = text.replace(/[\r\n]+/g, ' ').trim();
      const textWidth = font.widthOfTextAtSize(sanitizedText, size);
      const centeredX = x + (w - textWidth) / 2;
      firstPage.drawText(sanitizedText, { x: centeredX, y, size, font, color });
    };

    const drawMultiLineCenteredText = (text: string, x: number, y: number, w: number, font: any, size: number, color: any = rgb(0, 0, 0), lineHeight: number = 12) => {
      if (!text) return;
      const sanitizedText = text.replace(/[\r\n]+/g, ' ').trim();
      const words = sanitizedText.split(' ');
      let currentLine = '';
      let currentY = y;
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth <= w) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            const lineWidth = font.widthOfTextAtSize(currentLine, size);
            const centeredX = x + (w - lineWidth) / 2;
            firstPage.drawText(currentLine, { x: centeredX, y: currentY, size, font, color });
            currentY -= lineHeight;
          }
          currentLine = word;
        }
      }
      if (currentLine) {
        const lineWidth = font.widthOfTextAtSize(currentLine, size);
        const centeredX = x + (w - lineWidth) / 2;
        firstPage.drawText(currentLine, { x: centeredX, y: currentY, size, font, color });
      }
    };

    const drawRightAlignedText = (text: string, x: number, y: number, font: any, size: number, color: any = rgb(0, 0, 0)) => {
      if (!text) return;
      const width = font.widthOfTextAtSize(text, size);
      firstPage.drawText(text, { x: x - width, y, size, font, color });
    };

    const drawInvoiceRow = (y: number, label: string, info: string, val1: number, val2: number, val3: number, total: number, saldo: number) => {
      firstPage.drawText(label, { x: 16, y, size: 8, font: helveticaBold });
      firstPage.drawText(info, { x: 170, y, size: 8, font: helveticaBold });
      drawRightAlignedText(`$ ${formatNumber(val1)}`, 275, y, helveticaBold, 8);
      drawRightAlignedText(`$ ${formatNumber(val2)}`, 340, y, helveticaBold, 8);
      drawRightAlignedText(`$ ${formatNumber(val3)}`, 480, y, helveticaBold, 8);
      drawRightAlignedText(`$ ${formatNumber(total)}`, 545, y, helveticaBold, 8);
      if (saldo > 0) {
        drawRightAlignedText(`$ ${formatNumber(saldo)}`, 596, y, helveticaBold, 8);
      }
    };

    const drawInvoiceSection = (baseY: number) => {
      const headerBoxX = 50;
      const headerBoxWidth = 300;

      drawCenteredText(empresa.nombre || '', headerBoxX, baseY - 25, headerBoxWidth, helveticaBold, 13);
      drawCenteredText(`NIT: ${empresa.ident || ''} Tel: ${empresa.telefono || ''}`, headerBoxX, baseY - 37, headerBoxWidth, helveticaFont, 10);
      drawCenteredText(empresa.direccion || '', headerBoxX, baseY - 47, headerBoxWidth, helveticaFont, 10);

      const descriptionBoxX = headerBoxX + 60;
      const descriptionBoxWidth = headerBoxWidth - 120;
      drawMultiLineCenteredText(empresa.descripcion || '', descriptionBoxX, baseY - 57, descriptionBoxWidth, helveticaFont, 10);

      firstPage.drawText(`${factura.prefijo}-${factura.factura}`, {
        x: 427, y: baseY - 35, size: 6, font: helveticaBold, color: rgb(1, 0, 0)
      });

      firstPage.drawText(`${factura.instalacion_codigo}`, {
        x: 555, y: baseY - 35, size: 8, font: helveticaBold, color: rgb(1, 0, 0)
      });

      drawCenteredText(`${factura.mes_nombre} de ${factura.year}`, 300, baseY - 65, 200, helveticaBold, 8);
      drawCenteredText(`FACTURA DE SERVICIOS PUBLICOS: ${factura.factura}`, 300, baseY - 77, 200, helveticaBold, 7);
      drawMultiLineCenteredText(` ${factura.nota_cuentas_vencidas}`, 505, baseY - 60, 95, helveticaBold, 6, rgb(1, 0, 0));
      drawMultiLineCenteredText(` $ ${formatNumber(factura.saldo)}`, 480, baseY - 106, 100, helveticaBold, 15, rgb(0, 0, 1));

      firstPage.drawText(` ${factura.nombre} CC: ${factura.ident} Dirección: ${factura.direccion} Teléfono: ${factura.telefono}`, {
        x: 30, y: baseY - 146, size: 8, font: helveticaBold
      });

      firstPage.drawText(` Estrato: ${factura.estrato} Medidor: ${factura.codigo_medidor} Uso: ${factura.uso_nombre} Sector: ${factura.sector_nombre}`, {
        x: 30, y: baseY - 163, size: 8, font: helveticaBold
      });

      firstPage.drawText(` Consumo del ${formatDate(String(factura.consumo_desde))} al ${formatDate(String(factura.consumo_hasta))} del mes de ${factura.mes_nombre} año  ${factura.year}`, {
        x: 95, y: baseY - 189, size: 8, font: helveticaBold
      });

      firstPage.drawText(` Sin recargo: ${formatDate(String(factura.sin_recargo))}               Con recargo: ${formatDate(String(factura.con_recargo))}             Lectura Actual: ${factura.lectura}                Lectura Anterior: ${factura.lec_ant}                Consumo M3: ${factura.consumo}`, {
        x: 16, y: baseY - 205, size: 8, font: helveticaBold
      });

      let currentY = baseY - 240;
      const rowHeight = 10;

      if (Number(factura.cargo_fijo) > 0) {
        drawInvoiceRow(currentY, "Cargo Fijo ", "1 Mes", factura.cargo_fijo, factura.cargo_fijo, factura.valor_subsidio_cargo_fijo, Number(factura.cargo_fijo) + Number(factura.valor_subsidio_cargo_fijo), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.valor_basico) > 0) {
        drawInvoiceRow(currentY, "Consumo Basico ", "1 Mes", factura.v_u_basico ?? 0, factura.valor_basico, factura.valor_subsidio_consumo, Number(factura.valor_basico) + Number(factura.valor_subsidio_consumo), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.valor_complementario) > 0) {
        drawInvoiceRow(currentY, "Consumo Complemetario", `${factura.complementario} M3`, factura.v_u_complementario ?? 0, factura.valor_complementario, factura.valor_sub_complementario, Number(factura.valor_complementario) + Number(factura.valor_sub_complementario), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.valor_suntuario) > 0) {
        drawInvoiceRow(currentY, "Consumo Suntuario", `${factura.suntuario} M3`, factura.v_u_suntuario ?? 0, factura.valor_suntuario, factura.valor_sub_suntuario, Number(factura.valor_suntuario) + Number(factura.valor_sub_suntuario), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.cuota_conexion) > 0) {
        drawInvoiceRow(currentY, "Cuota de Conexión", `1`, factura.cuota_conexion ?? 0, factura.cuota_conexion, 0, Number(factura.cuota_conexion), Number(factura.saldo_conexion));
        currentY -= rowHeight;
      }
      if (Number(factura.cuota_medidor) > 0) {
        drawInvoiceRow(currentY, "Cuota de Medidor", `1`, factura.cuota_medidor ?? 0, factura.cuota_medidor, 0, Number(factura.cuota_medidor), Number(factura.saldo_medidor));
        currentY -= rowHeight;
      }
      if (Number(factura.cuota_diferido) > 0) {
        drawInvoiceRow(currentY, "Cuota Diferida", `1`, factura.cuota_diferido ?? 0, factura.cuota_diferido, 0, Number(factura.cuota_diferido), Number(factura.saldo_diferido));
        currentY -= rowHeight;
      }
      drawMultiLineCenteredText(` $${formatNumber(factura.total_total)}`, 470, baseY - 364, 100, helveticaBold, 12, rgb(1, 1, 1));

      if (Number(factura.interes) > 0) {
        drawInvoiceRow(currentY, "Interes por Mora", `1`, factura.interes ?? 0, factura.interes, 0, Number(factura.interes), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.interes_capital_saldo_anterior) > 0) {
        drawInvoiceRow(currentY, "Interes Capital Saldo Anterior", `1`, factura.interes_capital_saldo_anterior ?? 0, factura.interes_capital_saldo_anterior, 0, Number(factura.interes_capital_saldo_anterior), 0);
        currentY -= rowHeight;
      }
      if (Number(factura.saldo_anterior) > 0) {
        drawInvoiceRow(currentY, "Saldo Anterior", `1`, factura.saldo_anterior ?? 0, factura.saldo_anterior, 0, Number(factura.saldo_anterior), 0);
        currentY -= rowHeight;
      }
    };

    // Dibujar ambas secciones
    drawInvoiceSection(height);
    drawInvoiceSection(height / 2.04);

    // Guardar y convertir a base64
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Enviar por WhatsApp
    await whatsappService.enviarFacturaWhatsapp({
      telefono: factura.telefono,
      pdfBase64: base64,
      factura: factura.factura.toString(),
      prefijo: factura.prefijo
    });

    $q.notify({
      type: 'positive',
      message: `Factura enviada por WhatsApp a ${factura.telefono}`,
      position: 'center'
    });

  } catch (error: any) {
    console.error('Error al enviar WhatsApp:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al enviar WhatsApp',
      position: 'center'
    });
  } finally {
    $q.loading.hide();
  }
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
      position: 'center'
    });
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a Excel: ' + error.message,
      position: 'center'
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

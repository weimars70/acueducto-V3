<template>
  <q-page padding>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <q-icon name="send" size="32px" color="white" />
          <div>
            <h1 class="page-title">Envío Masivo de Facturas</h1>
            <p class="page-subtitle">Enviar facturas por email y WhatsApp de forma masiva</p>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <div class="form-card">
        <div class="form-section">
          <div class="section-header">
            <q-icon name="event" size="20px" color="primary" />
            <span class="section-title">Periodo</span>
          </div>

          <div class="form-grid">
            <q-select
              v-model="formData.mes"
              :options="mesesOptions"
              label="Mes *"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => val !== null || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_month" />
              </template>
            </q-select>

            <q-select
              v-model="formData.year"
              :options="yearsOptions"
              label="Año *"
              outlined
              dense
              :rules="[val => val !== null || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <q-icon name="settings" size="20px" color="primary" />
            <span class="section-title">Opciones de Envío</span>
          </div>

          <div class="checkbox-container">
            <q-checkbox
              v-model="formData.enviarEmail"
              label="Enviar por Email"
              color="primary"
            />
            <q-checkbox
              v-model="formData.enviarWhatsapp"
              label="Enviar por WhatsApp"
              color="green"
            />
          </div>
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <q-btn
            label="Cancelar"
            color="grey-7"
            outline
            icon="close"
            @click="$router.back()"
            class="cancel-btn"
          />
          <q-btn
            label="Enviar"
            color="primary"
            unelevated
            icon="send"
            @click="enviarMasivo"
            :loading="loading"
            class="save-btn"
          />
        </div>
      </div>

      <!-- Progreso -->
      <div v-if="enviando" class="progress-card">
        <div class="progress-header">
          <q-icon name="hourglass_empty" size="24px" color="primary" />
          <span class="progress-title">Enviando facturas...</span>
        </div>

        <q-linear-progress
          :value="progreso / 100"
          color="primary"
          class="progress-bar"
          size="20px"
        >
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="primary" :label="`${progreso}%`" />
          </div>
        </q-linear-progress>

        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">Procesadas:</span>
            <span class="stat-value">{{ procesadas }} / {{ totalFacturas }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Exitosas:</span>
            <span class="stat-value success">{{ exitosas }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Errores:</span>
            <span class="stat-value error">{{ errores.length }}</span>
          </div>
        </div>
      </div>

      <!-- Resumen -->
      <div v-if="resumenVisible" class="resumen-card">
        <div class="resumen-header">
          <q-icon name="summarize" size="24px" color="primary" />
          <span class="resumen-title">Resumen del Envío</span>
        </div>

        <div class="resumen-stats">
          <div class="resumen-stat">
            <q-icon name="check_circle" size="32px" color="positive" />
            <div>
              <div class="resumen-stat-label">Exitosas</div>
              <div class="resumen-stat-value">{{ exitosas }}</div>
            </div>
          </div>
          <div class="resumen-stat">
            <q-icon name="error" size="32px" color="negative" />
            <div>
              <div class="resumen-stat-label">Errores</div>
              <div class="resumen-stat-value">{{ errores.length }}</div>
            </div>
          </div>
        </div>

        <div v-if="errores.length > 0" class="errores-section">
          <div class="errores-header">Detalle de Errores</div>
          <div class="errores-list">
            <div v-for="(error, index) in errores" :key="index" class="error-item">
              <q-icon name="warning" color="negative" />
              <span>{{ error }}</span>
            </div>
          </div>
        </div>

        <div class="resumen-actions">
          <q-btn
            label="Cerrar"
            color="primary"
            unelevated
            @click="cerrarResumen"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { apiClient } from '../services/api/client';
import { facturasService, type Factura } from '../services/api/facturas.service';
import { whatsappService } from '../services/api/whatsapp.service';
import { emailService } from '../services/api/email.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const enviando = ref(false);
const progreso = ref(0);
const procesadas = ref(0);
const totalFacturas = ref(0);
const exitosas = ref(0);
const errores = ref<string[]>([]);
const resumenVisible = ref(false);

const formData = ref({
  mes: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  enviarEmail: false,
  enviarWhatsapp: false
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

const enviarMasivo = async () => {
  try {
    // Validaciones
    if (!formData.value.enviarEmail && !formData.value.enviarWhatsapp) {
      $q.notify({
        type: 'warning',
        message: 'Debe seleccionar al menos una opción de envío (Email o WhatsApp)',
        position: 'center'
      });
      return;
    }

    if (!authStore.user?.empresaId) {
      $q.notify({
        type: 'negative',
        message: 'No se pudo obtener la empresa del usuario',
        position: 'center'
      });
      return;
    }

    loading.value = true;

    // Obtener lista de facturas a enviar
    const { data } = await apiClient.post('/facturas/obtener-facturas-masivo', {
      mes: formData.value.mes,
      year: formData.value.year,
      enviarEmail: formData.value.enviarEmail,
      enviarWhatsapp: formData.value.enviarWhatsapp
    });

    const totalEmail = data.totalEmail || 0;
    const totalWhatsapp = data.totalWhatsapp || 0;
    const total = totalEmail + totalWhatsapp;

    if (total === 0) {
      $q.notify({
        type: 'warning',
        message: 'No se encontraron facturas para enviar con los criterios seleccionados',
        position: 'center'
      });
      loading.value = false;
      return;
    }

    // Mostrar confirmación elaborada
    const detallesCanales = [];
    if (formData.value.enviarEmail) {
      detallesCanales.push(`
        <div style="
          background: white;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        ">
          <i class="material-icons" style="font-size: 32px; color: #ef4444; margin-bottom: 8px;">email</i>
          <div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
            ${totalEmail}
          </div>
          <div style="font-size: 13px; color: #64748b; font-weight: 600;">
            por Email
          </div>
        </div>
      `);
    }
    if (formData.value.enviarWhatsapp) {
      detallesCanales.push(`
        <div style="
          background: white;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        ">
          <i class="fab fa-whatsapp" style="font-size: 32px; color: #25d366; margin-bottom: 8px;"></i>
          <div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
            ${totalWhatsapp}
          </div>
          <div style="font-size: 13px; color: #64748b; font-weight: 600;">
            por WhatsApp
          </div>
        </div>
      `);
    }

    const gridCols = formData.value.enviarEmail && formData.value.enviarWhatsapp ? '1fr 1fr' : '1fr';

    $q.dialog({
      html: true,
      message: `
        <div style="padding: 16px;">
          <!-- Header -->
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
            <div style="
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            ">
              <i class="material-icons" style="font-size: 36px; color: white;">send</i>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                Confirmar Envío Masivo
              </div>
              <div style="font-size: 14px; color: #64748b;">
                Está a punto de enviar múltiples facturas
              </div>
            </div>
          </div>

          <!-- Estadísticas -->
          <div style="
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            border: 2px solid #e2e8f0;
          ">
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="font-size: 14px; color: #64748b; margin-bottom: 8px; font-weight: 600;">
                TOTAL DE FACTURAS
              </div>
              <div style="
                font-size: 48px;
                font-weight: 800;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              ">
                ${total}
              </div>
            </div>

            <!-- Detalles por canal -->
            <div style="
              display: grid;
              grid-template-columns: ${gridCols};
              gap: 12px;
            ">
              ${detallesCanales.join('')}
            </div>
          </div>

          <!-- Advertencia -->
          <div style="
            display: flex;
            align-items: start;
            gap: 12px;
            padding: 16px;
            background: #fff7ed;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
          ">
            <i class="material-icons" style="color: #f59e0b; font-size: 24px;">info</i>
            <div style="flex: 1;">
              <div style="font-size: 13px; color: #92400e; line-height: 1.6;">
                Este proceso puede tardar varios minutos dependiendo de la cantidad de facturas.
                Por favor, no cierre esta ventana hasta que finalice.
              </div>
            </div>
          </div>
        </div>
      `,
      ok: {
        label: 'Enviar Ahora',
        color: 'primary',
        unelevated: true,
        noCaps: true,
        icon: 'send',
        style: `
          min-width: 160px;
          height: 50px;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        `,
        class: 'hover-scale'
      },
      cancel: {
        label: 'Cancelar',
        color: 'grey-7',
        flat: true,
        noCaps: true,
        style: 'min-width: 140px; height: 50px; font-size: 16px; border-radius: 10px;',
        class: 'hover-light-grey'
      },
      persistent: true,
      class: 'confirmation-dialog',
      style: 'min-width: 550px; max-width: 600px;',
      cardStyle: 'border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);'
    }).onOk(async () => {
      await procesarEnvios(data);
    }).onCancel(() => {
      loading.value = false;
    });

  } catch (error: any) {
    console.error('Error al obtener facturas para envío masivo:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al obtener facturas',
      position: 'center'
    });
    loading.value = false;
  }
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

// Función para generar el PDF de una factura (reutilizada de FacturasPage)
const generarPDFFactura = async (factura: Factura, empresa: any): Promise<string> => {
  // Cargar el PDF template comprimido para WhatsApp/Email
  const existingPdfBytes = await fetch('/formato_factura_socorro_whatsapp.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // Configurar fuentes
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Helpers para dibujar texto
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

  return base64;
};

const procesarEnvios = async (data: any) => {
  enviando.value = true;
  progreso.value = 0;
  procesadas.value = 0;
  exitosas.value = 0;
  errores.value = [];

  const facturasEmail = data.facturasEmail || [];
  const facturasWhatsapp = data.facturasWhatsapp || [];
  totalFacturas.value = facturasEmail.length + facturasWhatsapp.length;

  try {
    // Obtener info de la empresa una sola vez
    const empresa = await facturasService.getEmpresaInfo();

    // Procesar envíos por Email
    if (formData.value.enviarEmail && facturasEmail.length > 0) {
      for (const facturaData of facturasEmail) {
        try {
          // Obtener factura completa con todos los datos
          const facturaCompleta = await facturasService.getFacturas({
            mes: facturaData.mes,
            year: facturaData.year,
            factura: facturaData.codigo,
            limit: 1
          });

          if (!facturaCompleta.data || facturaCompleta.data.length === 0) {
            throw new Error(`No se encontró la factura ${facturaData.codigo}`);
          }

          const factura = facturaCompleta.data[0];

          // Validar que tenga email
          if (!factura.email || factura.email.trim() === '') {
            errores.value.push(`Factura ${factura.prefijo}-${factura.factura}: Sin email registrado`);
            procesadas.value++;
            progreso.value = Math.round((procesadas.value / totalFacturas.value) * 100);
            continue;
          }

          // Generar PDF
          const pdfBase64 = await generarPDFFactura(factura, empresa);

          // Enviar por Email
          await emailService.enviarFacturaEmail({
            emailDestinatario: factura.email,
            pdfBase64: pdfBase64,
            factura: factura.factura.toString(),
            prefijo: factura.prefijo,
            nombreCliente: factura.nombre
          });

          exitosas.value++;
        } catch (error: any) {
          errores.value.push(`Factura ${facturaData.codigo} (Email): ${error.message}`);
        }

        procesadas.value++;
        progreso.value = Math.round((procesadas.value / totalFacturas.value) * 100);
      }
    }

    // Procesar envíos por WhatsApp
    if (formData.value.enviarWhatsapp && facturasWhatsapp.length > 0) {
      for (const facturaData of facturasWhatsapp) {
        try {
          // Obtener factura completa con todos los datos
          const facturaCompleta = await facturasService.getFacturas({
            mes: facturaData.mes,
            year: facturaData.year,
            factura: facturaData.codigo,
            limit: 1
          });

          if (!facturaCompleta.data || facturaCompleta.data.length === 0) {
            throw new Error(`No se encontró la factura ${facturaData.codigo}`);
          }

          const factura = facturaCompleta.data[0];

          // Validar que tenga teléfono
          if (!factura.telefono || factura.telefono.trim() === '') {
            errores.value.push(`Factura ${factura.prefijo}-${factura.factura}: Sin teléfono registrado`);
            procesadas.value++;
            progreso.value = Math.round((procesadas.value / totalFacturas.value) * 100);
            continue;
          }

          // Generar PDF
          const pdfBase64 = await generarPDFFactura(factura, empresa);

          // Enviar por WhatsApp
          await whatsappService.enviarFacturaWhatsapp({
            telefono: factura.telefono,
            pdfBase64: pdfBase64,
            factura: factura.factura.toString(),
            prefijo: factura.prefijo
          });

          exitosas.value++;
        } catch (error: any) {
          errores.value.push(`Factura ${facturaData.codigo} (WhatsApp): ${error.message}`);
        }

        procesadas.value++;
        progreso.value = Math.round((procesadas.value / totalFacturas.value) * 100);
      }
    }

    enviando.value = false;
    loading.value = false;
    resumenVisible.value = true;

  } catch (error: any) {
    console.error('Error durante el proceso de envío masivo:', error);
    $q.notify({
      type: 'negative',
      message: error.message || 'Error durante el proceso de envío',
      position: 'center'
    });
    enviando.value = false;
    loading.value = false;
  }
};

const cerrarResumen = () => {
  resumenVisible.value = false;
  progreso.value = 0;
  procesadas.value = 0;
  exitosas.value = 0;
  errores.value = [];
};
</script>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.page-subtitle {
  font-size: 14px;
  margin: 4px 0 0 0;
  opacity: 0.9;
  color: white;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.checkbox-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
}

.cancel-btn,
.save-btn {
  min-width: 140px;
  height: 48px;
  font-weight: 600;
  text-transform: none;
  font-size: 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #fff4e6 !important;
  border-color: #fb923c !important;
  color: #ea580c !important;
}

.save-btn {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.save-btn:hover {
  background: #28A745 !important;
  border-color: #28A745 !important;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4) !important;
  transform: translateY(-2px);
}

.progress-card,
.resumen-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.progress-header,
.resumen-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.progress-title,
.resumen-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.progress-bar {
  margin: 24px 0;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #374151;
}

.stat-value.success {
  color: #10b981;
}

.stat-value.error {
  color: #ef4444;
}

.resumen-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 32px 0;
}

.resumen-stat {
  display: flex;
  align-items: center;
  gap: 16px;
}

.resumen-stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.resumen-stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #374151;
}

.errores-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
}

.errores-header {
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 16px;
}

.errores-list {
  max-height: 300px;
  overflow-y: auto;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #991b1b;
}

.resumen-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-card,
  .progress-card,
  .resumen-card {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .progress-stats {
    flex-direction: column;
    gap: 16px;
  }

  .resumen-stats {
    flex-direction: column;
    gap: 32px;
  }
}

/* Hover effects for dialog buttons */
.hover-light-grey:hover {
  background: #f1f5f9 !important;
}

.hover-scale:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5) !important;
}

.hover-scale {
  transition: all 0.3s ease;
}
</style>

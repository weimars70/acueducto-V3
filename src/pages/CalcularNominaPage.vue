<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { nominasService } from '../services/api/nomina.service';
import { periodoNominaService } from '../services/api/periodo-nomina.service';
import { empleadoService } from '../services/api/empleado.service';
import type { PeriodoNomina } from '../types/periodo-nomina';
import type { Empleado } from '../types/empleado';
import { useExport } from '../composables/useExport';
import { nominaCatalogsService } from '../services/api/nomina-catalogs.service';
import { dianService } from '../services/api/dian.service';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const {
  exportToExcel,
  exportToPDF,
  exportNominaVouchers,
  generateNominaVouchers
} = useExport();

// Catalogos y Datos DIAN
const payrollPeriods = ref([]);

const loadNominaCatalogs = async () => {
    try {
        const periods = await nominaCatalogsService.getPayrollPeriods();
        payrollPeriods.value = periods;
    } catch (e) {
        console.error('Error loading payroll periods catalog', e);
    }
}

// Inicializar catálogos
onMounted(() => {
  loadNominaCatalogs();
});

const downloadDianJson = async (nominaId: number, empleado: any) => {
    try {
        $q.loading.show({ message: 'Generando JSON DIAN...' });
        const json = await dianService.getNominaJson(nominaId);
        
        // Crear Blob y descargar
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `NE_${empleado.cedula}_${json.consecutive}.json`;
        link.click();
        URL.revokeObjectURL(link.href);

        $q.notify({
            type: 'positive',
            message: 'JSON DIAN descargado correctamente'
        });
    } catch (e: any) {
        console.error('Error downloading DIAN JSON', e);
        $q.notify({
            type: 'negative',
            message: 'Error al descargar el JSON de la DIAN'
        });
    } finally {
        $q.loading.hide();
    }
};
const loading = ref(false);
const showPreviewModal = ref(false);
const showCreatePeriodModal = ref(false);
const previewPdfUrl = ref('');
const currentVouchers = ref<any[]>([]);
const previewFilename = ref('');
const newPeriod = ref<any>({
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  dias_periodo: 15,
  id_payroll_periods: undefined
});
const periodoId = ref<number | null>(null);
const periodo = ref<PeriodoNomina | null>(null);
const periodos = ref<PeriodoNomina[]>([]);
const empleadosData = ref<any[]>([]);
const empresaId = ref(1); // TODO: obtener del store de auth
const filter = ref('');

interface EmpleadoNominaRow {
  empleado: Empleado;
  nomina: any;
  horasExtrasDiurnas: number;
  horasExtrasFestivas: number;
  otrosPagos: number;
  otrasDeducciones: number;
  horasExtrasData: { diurnas: any[]; festivas: any[] };
  otrosPagosData: any[];
}

const loadPeriodos = async () => {
  try {
    console.log('Cargando períodos de nómina...');
    const response = await periodoNominaService.getPeriodos({ page: 1, limit: 100 });
    console.log('Respuesta de períodos:', response);

    periodos.value = response.data || [];
    console.log('Períodos cargados:', periodos.value.length);

    if (periodos.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No hay períodos de nómina creados. Por favor cree un período primero.',
        caption: 'Vaya a Nómina > Períodos > + Nuevo Período',
        actions: [
          {
            label: 'Crear Período',
            color: 'white',
            handler: () => {
              router.push('/periodos-nomina/new');
            }
          }
        ],
        timeout: 8000,
        position: 'top'
      });
    }

    if (route.query.periodoId) {
      periodoId.value = Number(route.query.periodoId);
      await loadData();
    }
  } catch (error: any) {
    console.error('Error al cargar períodos:', error);
    console.error('Detalles del error:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });

    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Error al cargar los períodos de nómina',
      caption: error?.response?.status === 401
        ? 'Por favor inicie sesión nuevamente'
        : 'Revise la consola para más detalles',
      timeout: 5000,
      position: 'top'
    });
  }
};

const loadData = async () => {
  if (!periodoId.value) return;

  try {
    loading.value = true;
    console.log('Cargando empleados para período:', periodoId.value);

    const data = await nominasService.getEmpleadosConNominas(periodoId.value);
    console.log('Empleados recibidos:', data);
    console.log('Cantidad de empleados:', data?.length || 0);

    empleadosData.value = data || [];

    // Cargar período
    periodo.value = await periodoNominaService.getPeriodo(periodoId.value);
    console.log('Período cargado:', periodo.value);

    if (empleadosData.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No hay empleados activos para calcular nómina',
        caption: 'Primero debe crear empleados activos en el sistema',
        actions: [
          {
            label: 'Ir a Empleados',
            color: 'white',
            handler: () => {
              router.push('/empleados');
            }
          }
        ],
        timeout: 8000,
        position: 'top'
      });
    }
  } catch (error: any) {
    console.error('Error al cargar datos:', error);
    console.error('Detalles del error:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });

    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Error al cargar los datos',
      caption: 'Revise la consola del navegador para más detalles',
      timeout: 5000,
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const calcularValorHora = (salarioMensual: number) => {
  return salarioMensual / 220;
};

const calcularSalarioBasico = (salarioMensual: number, diasPeriodo: number) => {
  if (diasPeriodo === 15) {
    return salarioMensual / 2;
  }
  return (salarioMensual / 30) * diasPeriodo;
};

const calcularHEDiurna = (row: EmpleadoNominaRow, valorHora: number) => {
  return row.horasExtrasDiurnas * valorHora * 1.25;
};

const calcularHEFestiva = (row: EmpleadoNominaRow, valorHora: number) => {
  return row.horasExtrasFestivas * valorHora * 1.80;
};

const calcularAuxilioTransporte = (row: EmpleadoNominaRow, diasPeriodo: number) => {
  if (!row.empleado.auxilio_transporte) return 0;
  const auxilioMensual = 200000; // TODO: obtener de parámetros
  if (diasPeriodo === 15) {
    return auxilioMensual / 2;
  }
  return (auxilioMensual / 30) * diasPeriodo;
};

const calcularSalud = (baseCotizacion: number) => {
  return baseCotizacion * 0.04;
};

const calcularPension = (baseCotizacion: number) => {
  return baseCotizacion * 0.04;
};

const calcularTotales = (row: EmpleadoNominaRow) => {
  const valorHora = calcularValorHora(row.empleado.salario_mensual);
  const diasPeriodo = periodo.value?.dias_periodo || 15;
  const salarioBasico = calcularSalarioBasico(row.empleado.salario_mensual, diasPeriodo);
  const heDiurna = calcularHEDiurna(row, valorHora);
  const heFestiva = calcularHEFestiva(row, valorHora);
  const auxTransporte = calcularAuxilioTransporte(row, diasPeriodo);
  
  // Base para salud y pensión (IBC)
  const baseCotizacion = salarioBasico + heDiurna + heFestiva;

  const salud = calcularSalud(baseCotizacion);
  const pension = calcularPension(baseCotizacion);

  const totalDevengado = salarioBasico + heDiurna + heFestiva + auxTransporte + row.otrosPagos;
  const totalDeducciones = salud + pension + row.otrasDeducciones;
  const netoPagar = totalDevengado - totalDeducciones;

  return {
    salarioBasico,
    heDiurna,
    heFestiva,
    auxTransporte,
    salud,
    pension,
    totalDevengado,
    totalDeducciones,
    netoPagar,
  };
};

const isPeriodoAprobado = computed(() => {
  return empleadosData.value.some(e => e.nomina && e.nomina.estado !== 'BORRADOR');
});

const filteredEmpleados = computed(() => {
  if (!filter.value) return empleadosData.value;
  const search = filter.value.toLowerCase();
  return empleadosData.value.filter(e =>
    e.empleado.nombre_completo.toLowerCase().includes(search) ||
    e.empleado.cedula.includes(search)
  );
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const handleAgregarHoraExtra = async (row: EmpleadoNominaRow, tipo: 'DIURNA' | 'FESTIVA') => {
  $q.dialog({
    title: `Agregar Hora Extra ${tipo === 'DIURNA' ? 'Diurna' : 'Festiva'}`,
    message: `Empleado: ${row.empleado.nombre_completo}`,
    prompt: {
      model: '',
      type: 'number',
      label: 'Cantidad de horas',
      placeholder: 'Ej: 2.5'
    },
    cancel: true,
    persistent: true
  }).onOk(async (horas: string) => {
    if (!periodoId.value) return;
    
    try {
      await nominasService.crearHoraExtra({
        empleadoId: row.empleado.id,
        periodoId: periodoId.value,
        tipo,
        cantidadHoras: Number(horas),
        fecha: new Date().toISOString().split('T')[0],
        aprobado: true,
      });
      
      $q.notify({
        type: 'positive',
        message: 'Hora extra agregada exitosamente'
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Error al agregar hora extra:', error);
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.message || 'Error al agregar hora extra'
      });
    }
  });
};

const handleAgregarOtroPago = async (row: EmpleadoNominaRow, tipo: 'INGRESO' | 'DEDUCCION') => {
  $q.dialog({
    title: `Agregar ${tipo === 'INGRESO' ? 'Otro Pago' : 'Deducción'}`,
    message: `Empleado: ${row.empleado.nombre_completo}`,
    prompt: {
      model: '',
      type: 'text',
      label: 'Concepto',
      placeholder: 'Ej: Bonificación'
    },
    cancel: true,
    persistent: true
  }).onOk(async (concepto: string) => {
    $q.dialog({
      title: 'Valor',
      prompt: {
        model: '',
        type: 'number',
        label: 'Valor',
        placeholder: 'Ej: 50000'
      },
      cancel: true,
      persistent: true
    }).onOk(async (valor: string) => {
      if (!periodoId.value) return;
      
      try {
        await nominasService.crearOtroPago({
          empleadoId: row.empleado.id,
          periodoId: periodoId.value,
          concepto,
          valor: Number(valor),
          tipo,
          aprobado: true,
        });
        
        $q.notify({
          type: 'positive',
          message: `${tipo === 'INGRESO' ? 'Pago' : 'Deducción'} agregado exitosamente`
        });
        
        await loadData();
      } catch (error: any) {
        console.error('Error al agregar otro pago:', error);
        $q.notify({
          type: 'negative',
          message: error?.response?.data?.message || 'Error al agregar'
        });
      }
    });
  });
};

const handleGenerarNominas = async () => {
  if (!periodoId.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor seleccione un período'
    });
    return;
  }

  $q.dialog({
    title: 'Generar Nóminas',
    message: `¿Desea generar nóminas para todos los empleados activos del período seleccionado?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Generando nóminas...' });
      await nominasService.generarNominasParaPeriodo(periodoId.value!);
      $q.notify({
        type: 'positive',
        message: 'Nóminas generadas exitosamente'
      });
      await loadData();
    } catch (error: any) {
      console.error('Error al generar nóminas:', error);
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.message || 'Error al generar las nóminas'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

const handleCalcularTodas = async () => {
  if (!periodoId.value) return;

  $q.dialog({
    title: 'Calcular Todas las Nóminas',
    message: `¿Desea calcular todas las nóminas del período?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Calculando nóminas...' });
      
      for (const row of empleadosData.value) {
        if (row.nomina) {
          try {
            await nominasService.calcularNomina(row.nomina.id);
          } catch (error) {
            console.error(`Error al calcular nómina ${row.nomina.id}:`, error);
          }
        }
      }
      
      $q.notify({
        type: 'positive',
        message: 'Nóminas calculadas exitosamente'
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Error al calcular nóminas:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al calcular las nóminas'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

const handleCalcularIndividual = async (row: EmpleadoNominaRow) => {
  if (!row.nomina) return;
  try {
    $q.loading.show({ message: 'Calculando nómina...' });
    await nominasService.calcularNomina(row.nomina.id);
    $q.notify({
      type: 'positive',
      message: 'Nómina calculada exitosamente'
    });
    await loadData();
  } catch (error: any) {
    console.error('Error al calcular nómina individual:', error);
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'Error al calcular la nómina'
    });
  } finally {
    $q.loading.hide();
  }
};

const handleAprobarTodas = async () => {
  if (!periodoId.value) return;

  $q.dialog({
    title: 'Fijar y Aprobar Todas',
    message: `¿Está seguro de aprobar todas las nóminas del período? Una vez aprobadas, no podrán ser modificadas.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Aprobando nóminas...' });
      
      for (const row of empleadosData.value) {
        if (row.nomina && row.nomina.estado === 'BORRADOR') {
          try {
            await nominasService.aprobarNomina({ nominaId: row.nomina.id });
          } catch (error) {
            console.error(`Error al aprobar nómina ${row.nomina.id}:`, error);
          }
        }
      }
      
      $q.notify({
        type: 'positive',
        message: 'Nóminas aprobadas y fijadas exitosamente'
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Error al aprobar nóminas:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al aprobar las nóminas'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'empleado', label: 'Empleado' },
      { field: 'sueldo_mensual', label: 'Salario Mensual' },
      { field: 'valor_hora', label: 'Valor Hora' },
      { field: 'dias', label: 'Días' },
      { field: 'salario_basico', label: 'Salario Básico' },
      { field: 'cant_he_diurna', label: 'Cant. H.E. Diurna' },
      { field: 'valor_he_diurna', label: '$ H.E. Diurna' },
      { field: 'cant_he_festiva', label: 'Cant. H.E. Festiva' },
      { field: 'valor_he_festiva', label: '$ H.E. Festiva' },
      { field: 'aux_transporte', label: 'Aux. Transporte' },
      { field: 'otros_pagos', label: 'Otros Pagos' },
      { field: 'total_devengado', label: 'Total Devengado' },
      { field: 'salud', label: 'Salud (4%)' },
      { field: 'pension', label: 'Pensión (4%)' },
      { field: 'otras_deducciones', label: 'Otras Deducciones' },
      { field: 'total_deducciones', label: 'Total Deducciones' },
      { field: 'neto_pagar', label: 'Neto a Pagar' }
    ];
    const dataToExport = empleadosData.value.map(row => {
      const totales = calcularTotales(row);
      return {
        empleado: row.empleado.nombre_completo,
        sueldo_mensual: row.empleado.salario_mensual,
        valor_hora: calcularValorHora(row.empleado.salario_mensual),
        dias: periodo.value?.dias_periodo || 15,
        salario_basico: totales.salarioBasico,
        cant_he_diurna: row.horasExtrasDiurnas,
        valor_he_diurna: totales.heDiurna,
        cant_he_festiva: row.horasExtrasFestivas,
        valor_he_festiva: totales.heFestiva,
        aux_transporte: totales.auxTransporte,
        otros_pagos: row.otrosPagos,
        total_devengado: totales.totalDevengado,
        salud: totales.salud,
        pension: totales.pension,
        otras_deducciones: row.otrasDeducciones,
        total_deducciones: totales.totalDeducciones,
        neto_pagar: totales.netoPagar
      };
    });

    exportToExcel(dataToExport, exportColumns, `calculo_nomina_${periodo.value?.nombre || 'periodo'}`);
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'empleado', label: 'Empleado' },
      { field: 'dias', label: 'Días' },
      { field: 'salario_basico', label: 'Básico' },
      { field: 'valor_he_diurna', label: 'H.E. Diur' },
      { field: 'valor_he_festiva', label: 'H.E. Fest' },
      { field: 'aux_transporte', label: 'Aux. Transp' },
      { field: 'total_devengado', label: 'Devengado' },
      { field: 'salud', label: 'Salud' },
      { field: 'pension', label: 'Pensión' },
      { field: 'total_deducciones', label: 'Deducciones' },
      { field: 'neto_pagar', label: 'Neto' }
    ];

    const dataToExport = empleadosData.value.map(row => {
      const totales = calcularTotales(row);
      return {
        empleado: row.empleado.nombre_completo,
        dias: periodo.value?.dias_periodo || 15,
        salario_basico: formatCurrency(totales.salarioBasico),
        valor_he_diurna: formatCurrency(totales.heDiurna),
        valor_he_festiva: formatCurrency(totales.heFestiva),
        aux_transporte: formatCurrency(totales.auxTransporte),
        total_devengado: formatCurrency(totales.totalDevengado),
        salud: formatCurrency(totales.salud),
        pension: formatCurrency(totales.pension),
        total_deducciones: formatCurrency(totales.totalDeducciones),
        neto_pagar: formatCurrency(totales.netoPagar)
      };
    });

    exportToPDF(dataToExport, exportColumns, `calculo_nomina_${periodo.value?.nombre || 'periodo'}`, `Cáculo de Nómina - ${periodo.value?.nombre || ''}`, 'l');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

const handlePrintVouchers = async () => {
  if (!periodoId.value || !empleadosData.value.length || !periodo.value) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos o período seleccionado para generar volantes.'
    });
    return;
  }
  try {
    $q.loading.show({ message: 'Generando volantes de pago...' });

    const p = periodo.value;
    // Construir vouchers con los datos del listado
    const vouchers = empleadosData.value
      .filter(row => row.nomina || row.empleado)
      .map(row => {
        const totales = calcularTotales(row);
        return {
          id: row.nomina?.id,
          empleado: row.empleado,
          periodo: p,
          salarioMensual: row.empleado.salario_mensual,
          diasPagados: p.dias_periodo,
          totalDevengado: totales.totalDevengado,
          totalDeducciones: totales.totalDeducciones,
          netoPagar: totales.netoPagar,
          valorBasico: totales.salarioBasico,
          cantidadDiasBasico: p.dias_periodo,
          valorAuxTransporte: totales.auxTransporte,
          cantidadHEDiurna: row.horasExtrasDiurnas,
          valorHEDiurna: totales.heDiurna,
          cantidadHEFestiva: row.horasExtrasFestivas,
          valorHEFestiva: totales.heFestiva,
          valorSalud: totales.salud,
          valorPension: totales.pension,
          otrosPagos: row.otrosPagos,
          otrasDeducciones: row.otrasDeducciones,
          horasExtrasData: row.horasExtrasData,
          otrosPagosData: row.otrosPagosData
        };
      });

    if (vouchers.length === 0) {
      $q.notify({ type: 'warning', message: 'No hay empleados para imprimir' });
      return;
    }

    currentVouchers.value = vouchers;
    previewFilename.value = `vouchers_${periodo.value?.nombre || 'nomina'}`;
    const doc = generateNominaVouchers(vouchers);
    const blob = doc.output('blob');
    if (previewPdfUrl.value) URL.revokeObjectURL(previewPdfUrl.value);
    previewPdfUrl.value = URL.createObjectURL(blob);
    showPreviewModal.value = true;

  } catch (error) {
    console.error('Error al generar volantes de pago:', error);
    $q.notify({ type: 'negative', message: 'Error al generar volantes de pago' });
  } finally {
    $q.loading.hide();
  }
};

const handlePrintIndividualVoucher = async (row: EmpleadoNominaRow) => {
  if (!periodoId.value || !periodo.value) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos de nómina para generar el volante.'
    });
    return;
  }
  try {
    $q.loading.show({ message: `Generando volante para ${row.empleado.nombre_completo}...` });

    // Calcular todos los valores usando las funciones existentes
    const totales = calcularTotales(row);
    const valorHora = calcularValorHora(row.empleado.salario_mensual);

    const p = periodo.value;
    // Construir objeto de nómina con los datos del listado
    const nominaData = {
      id: row.nomina?.id,
      empleado: row.empleado,
      periodo: p,
      salarioMensual: row.empleado.salario_mensual,
      diasPagados: p.dias_periodo,
      totalDevengado: totales.totalDevengado,
      totalDeducciones: totales.totalDeducciones,
      netoPagar: totales.netoPagar,
      // Valores individuales para el detalle
      valorBasico: totales.salarioBasico,
      cantidadDiasBasico: p.dias_periodo,
      valorAuxTransporte: totales.auxTransporte,
      cantidadHEDiurna: row.horasExtrasDiurnas,
      valorHEDiurna: totales.heDiurna,
      cantidadHEFestiva: row.horasExtrasFestivas,
      valorHEFestiva: totales.heFestiva,
      valorSalud: totales.salud,
      valorPension: totales.pension,
      otrosPagos: row.otrosPagos,
      otrasDeducciones: row.otrasDeducciones,
      horasExtrasData: row.horasExtrasData,
      otrosPagosData: row.otrosPagosData
    };

    currentVouchers.value = [nominaData];
    previewFilename.value = `volante_${row.empleado.cedula}`;
    const doc = generateNominaVouchers([nominaData]);
    const blob = doc.output('blob');
    if (previewPdfUrl.value) URL.revokeObjectURL(previewPdfUrl.value);
    previewPdfUrl.value = URL.createObjectURL(blob);
    showPreviewModal.value = true;

  } catch (error) {
    console.error('Error al generar volante de pago individual:', error);
    $q.notify({ type: 'negative', message: 'Error al generar volante de pago' });
  } finally {
    $q.loading.hide();
  }
};

const handleDownloadFromPreview = () => {
  exportNominaVouchers(currentVouchers.value, previewFilename.value);
};

const handlePrintFromPreview = () => {
  const doc = generateNominaVouchers(currentVouchers.value);
  doc.autoPrint();
  const hUWA = doc.output('bloburl');
  window.open(hUWA, '_blank');
};

// Calcluar días cuando cambian las fechas
watch([() => newPeriod.value.fecha_inicio, () => newPeriod.value.fecha_fin], ([start, end]) => {
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    newPeriod.value.dias_periodo = diffDays;
  }
});

onMounted(() => {
  loadPeriodos();
});

onUnmounted(() => {
  if (previewPdfUrl.value) {
    URL.revokeObjectURL(previewPdfUrl.value);
  }
});
</script>

<template>
  <q-page padding>
    <!-- Header -->
    <q-card flat class="q-mb-md shadow-1" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <q-card-section class="text-white">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5 text-weight-bold">
              <q-icon name="calculate" size="32px" class="q-mr-sm" />
              Calcular Nómina
            </div>
            <div class="text-subtitle2 q-mt-xs" style="opacity: 0.9">
              Gestión de nóminas tipo Excel
            </div>
          </div>
          <div class="col-auto row q-gutter-sm items-center">
            <q-btn
              unelevated
              color="white"
              text-color="primary"
              icon="add"
              label="Nuevo Período"
              @click="showCreatePeriodModal = true"
              class="text-weight-bold"
            />
            <q-select
              v-model="periodoId"
              :options="periodos"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              outlined
              dense
              :placeholder="periodos.length === 0 ? 'No hay períodos' : 'Seleccionar período...'"
              :disable="periodos.length === 0"
              class="bg-white"
              style="min-width: 250px"
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    <div class="text-center q-pa-md">
                      <q-icon name="info" size="2em" class="q-mb-sm" />
                      <div>No hay períodos creados</div>
                      <q-btn
                        flat
                        color="primary"
                        label="Crear Período"
                        size="sm"
                        class="q-mt-sm"
                        @click="router.push('/periodos-nomina/new')"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Actions Bar -->
    <q-card flat class="q-mb-md shadow-1" v-if="periodoId">
      <q-card-section>
        <div class="row q-gutter-sm">
          <q-btn
            unelevated
            color="secondary"
            icon="view_agenda"
            label="Versión Vertical (V2)"
            @click="router.push('/nominas/nuevo-calculo')"
            class="q-mr-sm"
          >
             <q-tooltip>Nueva interfaz vertical detallada</q-tooltip>
          </q-btn>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Generar Nóminas"
            @click="handleGenerarNominas"
            :disable="loading || isPeriodoAprobado"
          />
          <q-btn
            unelevated
            color="green-7"
            icon="calculate"
            label="Procesar y Guardar Todo"
            @click="handleCalcularTodas"
            :disable="loading || !empleadosData.length || isPeriodoAprobado"
          >
            <q-tooltip>Calcula y guarda permanentemente los resultados en el sistema</q-tooltip>
          </q-btn>
          <q-btn
            unelevated
            color="deep-orange-7"
            icon="task_alt"
            label="Fijar y Aprobar Todo"
            @click="handleAprobarTodas"
            :disable="loading || !empleadosData.length || isPeriodoAprobado"
            class="q-ml-sm"
          >
            <q-tooltip>Aprueba todas las nóminas; después de esto no se podrán modificar</q-tooltip>
          </q-btn>
          <q-btn
            unelevated
            color="indigo-7"
            icon="description"
            label="Imprimir Volantes"
            @click="handlePrintVouchers"
            :disable="loading || !empleadosData.length"
            class="q-ml-sm"
          >
            <q-tooltip>Genera los comprobantes de pago de todos los empleados</q-tooltip>
          </q-btn>
          <q-space />
          <q-btn
            outline
            color="green-8"
            icon="file_download"
            label="Excel"
            @click="handleExportExcel"
            :disable="loading || !empleadosData.length"
          />
          <q-btn
            outline
            color="red-8"
            icon="picture_as_pdf"
            label="PDF"
            @click="handleExportPDF"
            :disable="loading || !empleadosData.length"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Preview Modal -->
    <q-dialog v-model="showPreviewModal" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="column full-height">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">
            <q-icon name="visibility" size="sm" class="q-mr-sm" />
            Previsualización de Comprobantes
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="col q-pa-none bg-grey-3">
          <iframe
            v-if="previewPdfUrl"
            :src="previewPdfUrl"
            style="width: 100%; height: 100%; border: none;"
          ></iframe>
          <div v-else class="flex flex-center full-height">
            <q-spinner color="primary" size="3em" />
            <div class="q-ml-md">Generando previsualización...</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md shadow-2">
          <q-btn
            flat
            label="Cerrar"
            color="grey-7"
            v-close-popup
            padding="sm lg"
          />
          <q-btn
            unelevated
            color="primary"
            icon="print"
            label="Imprimir"
            @click="handlePrintFromPreview"
            padding="sm lg"
          />
          <q-btn
            unelevated
            color="green-7"
            icon="download"
            label="Descargar PDF"
            @click="handleDownloadFromPreview"
            padding="sm lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Create Period Modal -->
    <q-dialog v-model="showCreatePeriodModal" persistent>
      <q-card style="min-width: 400px; border-radius: 12px;">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Crear Nuevo Período</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-form @submit="handleCreatePeriod" class="q-gutter-md">
            <q-input
              v-model="newPeriod.nombre"
              label="Nombre del Período"
              outlined
              dense
              placeholder="Ej: Nomina Diciembre 2023 - Primera Quincena"
              :rules="[val => !!val || 'El nombre es requerido']"
            />
            
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="newPeriod.fecha_inicio"
                  label="Fecha Inicio"
                  type="date"
                  outlined
                  dense
                  stack-label
                  :rules="[val => !!val || 'Requerido']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="newPeriod.fecha_fin"
                  label="Fecha Fin"
                  type="date"
                  outlined
                  dense
                  stack-label
                  :rules="[val => !!val || 'Requerido']"
                />
              </div>
            </div>

            <q-select
              v-model="newPeriod.id_payroll_periods"
              :options="payrollPeriods"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              outlined
              dense
              label="Frecuencia de Nómina"
              :rules="[val => !!val || 'Requerido']"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="schedule" />
              </template>
            </q-select>

            <q-input
              v-model.number="newPeriod.dias_periodo"
              label="Días del Período"
              type="number"
              outlined
              dense
              :rules="[val => !!val || 'Requerido', val => val > 0 || 'Debe ser mayor a 0']"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Cancelar" flat color="grey-7" v-close-popup />
              <q-btn label="Crear Período" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Table -->
    <q-card flat class="shadow-1" v-if="periodoId">
      <q-card-section>
        <div class="text-h6 q-mb-md" v-if="periodo">
          Período: {{ periodo.nombre }} ({{ periodo.dias_periodo }} días)
        </div>
        
        <div class="table-container" style="overflow-x: auto;">
          <table class="nomina-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Salario Mensual</th>
                <th>Valor Hora</th>
                <th>Días</th>
                <th>Salario Básico</th>
                <th>Cant. H.E. Diurnas</th>
                <th>$ H.E. Diurnas</th>
                <th>Cant. H.E. Festivas</th>
                <th>$ H.E. Festivas</th>
                <th>Aux. Transporte</th>
                <th>Otros Pagos</th>
                <th>Total Devengado</th>
                <th>Salud (4%)</th>
                <th>Pensión (4%)</th>
                <th>Otras Deducciones</th>
                <th>Total Deducciones</th>
                <th>Neto a Pagar</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredEmpleados" :key="row.empleado.id">
                <td>{{ row.empleado.nombre_completo }}</td>
                <td class="text-right">{{ formatCurrency(row.empleado.salario_mensual) }}</td>
                <td class="text-right">{{ formatCurrency(calcularValorHora(row.empleado.salario_mensual)) }}</td>
                <td class="text-center">{{ periodo?.dias_periodo || 15 }}</td>
                <td class="text-right">{{ formatCurrency(calcularTotales(row).salarioBasico) }}</td>
                <td class="text-center">
                  <div class="row items-center q-gutter-xs justify-center">
                    <span>{{ row.horasExtrasDiurnas.toFixed(2) }}</span>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="add"
                      color="green-7"
                      @click="handleAgregarHoraExtra(row, 'DIURNA')"
                      :disable="row.nomina && row.nomina.estado !== 'BORRADOR'"
                    >
                      <q-tooltip>Agregar Hora Extra Diurna</q-tooltip>
                    </q-btn>
                  </div>
                </td>
                <td class="text-right">
                  {{ formatCurrency(calcularTotales(row).heDiurna) }}
                </td>
                <td class="text-center">
                  <div class="row items-center q-gutter-xs justify-center">
                    <span>{{ row.horasExtrasFestivas.toFixed(2) }}</span>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="add"
                      color="orange-7"
                      @click="handleAgregarHoraExtra(row, 'FESTIVA')"
                      :disable="row.nomina && row.nomina.estado !== 'BORRADOR'"
                    >
                      <q-tooltip>Agregar Hora Extra Festiva</q-tooltip>
                    </q-btn>
                  </div>
                </td>
                <td class="text-right">
                  {{ formatCurrency(calcularTotales(row).heFestiva) }}
                </td>
                <td class="text-right">{{ formatCurrency(calcularTotales(row).auxTransporte) }}</td>
                <td class="text-right">
                  <div class="row items-center justify-end q-gutter-xs">
                    <span>{{ formatCurrency(row.otrosPagos) }}</span>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="add"
                      color="blue-7"
                      @click="handleAgregarOtroPago(row, 'INGRESO')"
                      :disable="row.nomina && row.nomina.estado !== 'BORRADOR'"
                    >
                      <q-tooltip>Agregar Otro Pago</q-tooltip>
                    </q-btn>
                  </div>
                </td>
                <td class="text-right text-weight-bold text-primary">
                  {{ formatCurrency(calcularTotales(row).totalDevengado) }}
                </td>
                <td class="text-right">{{ formatCurrency(calcularTotales(row).salud) }}</td>
                <td class="text-right">{{ formatCurrency(calcularTotales(row).pension) }}</td>
                <td class="text-right">
                  <div class="row items-center justify-end q-gutter-xs">
                    <span>{{ formatCurrency(row.otrasDeducciones) }}</span>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="add"
                      color="red-7"
                      @click="handleAgregarOtroPago(row, 'DEDUCCION')"
                      :disable="row.nomina && row.nomina.estado !== 'BORRADOR'"
                    >
                      <q-tooltip>Agregar Deducción</q-tooltip>
                    </q-btn>
                  </div>
                </td>
                <td class="text-right text-weight-bold text-red-7">
                  {{ formatCurrency(calcularTotales(row).totalDeducciones) }}
                </td>
                <td class="text-right text-weight-bold text-green-7" style="font-size: 1.1em">
                  {{ formatCurrency(calcularTotales(row).netoPagar) }}
                </td>
                <td>
                  <q-btn
                    v-if="row.nomina"
                    flat
                    dense
                    round
                    icon="print"
                    color="indigo-7"
                    @click="handlePrintIndividualVoucher(row)"
                  >
                    <q-tooltip>Imprimir Volante</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="row.nomina"
                    flat
                    dense
                    round
                    icon="visibility"
                    color="blue-7"
                    @click="router.push(`/nominas/${row.nomina.id}`)"
                  >
                    <q-tooltip>Ver Detalle</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="row.nomina"
                    flat
                    dense
                    round
                    icon="code"
                    color="purple-7"
                    @click="downloadDianJson(row.nomina.id, row.empleado)"
                  >
                    <q-tooltip>Descargar JSON DIAN</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="row.nomina && row.nomina.estado === 'BORRADOR'"
                    flat
                    dense
                    round
                    icon="calculate"
                    color="green-7"
                    @click="nominasService.calcularNomina(row.nomina.id).then(() => loadData())"
                  >
                    <q-tooltip>Calcular</q-tooltip>
                  </q-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!empleadosData.length && !loading" class="text-center q-pa-xl text-grey-7">
          <q-icon name="people_outline" size="4em" class="q-mb-md" />
          <div class="text-h6 q-mb-md">No hay empleados activos</div>
          <div class="q-mb-md">Para calcular nóminas necesita tener empleados activos en el sistema</div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Ir a Empleados"
            @click="router.push('/empleados')"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card flat class="shadow-1" v-else>
      <q-card-section class="text-center q-pa-xl text-grey-7">
        <q-icon name="event" size="3em" class="q-mb-md" />
        <div>Por favor seleccione un período para comenzar</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped lang="scss">
.table-container {
  max-width: 100%;
}

.nomina-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th, td {
    padding: 8px 12px;
    text-align: left;
    border: 1px solid #e0e0e0;
    white-space: nowrap;
  }

  th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tbody tr {
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f5f5f5;
    }

    &:nth-child(even) {
      background-color: #fafafa;
      
      &:hover {
        background-color: #f0f0f0;
      }
    }
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }
}
</style>


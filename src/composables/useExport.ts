import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

export interface ExportColumn {
    field: string;
    label: string;
    align?: 'left' | 'center' | 'right';
}

export function useExport() {
    const exportToExcel = (data: any[], columns: ExportColumn[], filename: string) => {
        try {
            // Preparar datos para Excel
            const excelData = data.map(row => {
                const obj: any = {};
                columns.forEach(col => {
                    obj[col.label] = row[col.field] === 0 ? 0 : (row[col.field] || '');
                });
                return obj;
            });

            // Crear workbook y worksheet
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Datos');

            // Ajustar ancho de columnas
            const maxWidth = 30;
            const colWidths = columns.map(col => ({
                wch: Math.min(col.label.length + 5, maxWidth)
            }));
            ws['!cols'] = colWidths;

            // Generar el archivo como un Buffer
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

            // Descargar usando FileSaver para mayor compatibilidad
            saveAs(blob, `${filename}.xlsx`);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            throw new Error('Error al exportar a Excel');
        }
    };

    const exportToPDF = (data: any[], columns: ExportColumn[], filename: string, title: string, orientation: 'p' | 'l' = 'p') => {
        try {
            const doc = new jsPDF({ orientation: orientation });

            // Título
            doc.setFontSize(16);
            doc.text(title, 14, 15);

            // Fecha
            doc.setFontSize(10);
            const fecha = new Date().toLocaleDateString('es-ES');
            doc.text(`Fecha: ${fecha}`, 14, 22);

            // Preparar datos para la tabla
            const headers = columns.map(col => col.label);
            const rows = data.map(row =>
                columns.map(col => String(row[col.field] === 0 ? 0 : (row[col.field] || '')))
            );

            // Determinar alineación por columna
            const columnStyles: any = {};
            columns.forEach((col, index) => {
                if (col.align) {
                    columnStyles[index] = { halign: col.align };
                }
            });

            // Generar tabla
            autoTable(doc, {
                head: [headers],
                body: rows,
                startY: 28,
                columnStyles: columnStyles,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                margin: { top: 28 },
            });

            // Descargar usando FileSaver para mayor compatibilidad
            const pdfBlob = doc.output('blob');
            saveAs(pdfBlob, `${filename}.pdf`);
        } catch (error) {
            console.error('Error al exportar a PDF:', error);
            throw new Error('Error al exportar a PDF');
        }
    };

    const generateNominaVouchers = (nominas: any[]) => {
        const doc = new jsPDF();
        const formatCurrency = (val: number) =>
            new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

        nominas.forEach((nomina, index) => {
            if (index > 0) doc.addPage();

            // --- MARCA DE AGUA ---
            try {
                doc.saveGraphicsState();
                doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
                const watermarkUrl = '/mg_socorro.png';
                doc.addImage(watermarkUrl, 'PNG', 30, 90, 130, 130);
                doc.restoreGraphicsState();
            } catch (error) {
                console.warn('No se pudo cargar la marca de agua:', error);
            }

            // --- HEADER SECTION ---
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);

            try {
                const logoUrl = '/logo_socorro.png';
                doc.addImage(logoUrl, 'PNG', 170, 5, 25, 25);
            } catch (error) {
                console.warn('No se pudo cargar el logo:', error);
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('ACUEDUCTO COMUNITARIO EL SOCORRO', 105, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.text('NIT: 811.012.202-5', 105, 20, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.text('CL 40 SUR N 24 E 19 - TEL: 3216230655', 105, 25, { align: 'center' });

            doc.setDrawColor(200);
            doc.setLineWidth(0.1);
            doc.rect(14, 32, 182, 10);
            doc.setFont('helvetica', 'bold');
            doc.text('Periodo', 16, 38.5);
            doc.text('Entre', 45, 38.5);
            doc.setFont('helvetica', 'normal');

            const fechaInicio = nomina.periodo?.fechaInicio || nomina.periodo?.fecha_inicio;
            const fechaFin = nomina.periodo?.fechaFin || nomina.periodo?.fecha_fin;
            const fechaInicioStr = fechaInicio ? new Date(fechaInicio).toLocaleDateString() : '';
            const fechaFinStr = fechaFin ? new Date(fechaFin).toLocaleDateString() : '';
            doc.text(`${nomina.periodo?.nombre || ''}  (${fechaInicioStr} al ${fechaFinStr})`, 70, 38.5);

            doc.rect(14, 42, 182, 18);
            doc.setFont('helvetica', 'bold');
            doc.text('EMPLEADO', 16, 48);
            doc.setFont('helvetica', 'normal');
            doc.text(`${nomina.empleado?.cedula || ''}`, 45, 48);
            doc.text(`${nomina.empleado_nombre || nomina.empleado?.nombre_completo || ''}`, 80, 48);

            doc.setFont('helvetica', 'bold');
            doc.text('SALARIO', 150, 48);
            doc.setFont('helvetica', 'normal');
            const salarioMensual = Number(
                nomina.empleado?.salarioMensual ||
                nomina.empleado?.salario_mensual ||
                nomina.salarioMensual ||
                nomina.salario_mensual
            ) || 0;
            doc.text(formatCurrency(salarioMensual), 170, 48);

            doc.setFont('helvetica', 'bold');
            doc.text('CARGO', 16, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(`${nomina.empleado?.cargo || 'OPERARIO'}`, 45, 55);

            const tableHeaders = [['CODIGO', 'DESCRIPCION', 'CANT', 'DEVENGADO', 'DEDUCCION', 'SALDO']];
            const tableData: any[] = [];

            const formatCantidad = (cantidad: number | undefined | null) => {
                if (cantidad === undefined || cantidad === null) return '';
                const num = Number(cantidad);
                if (isNaN(num) || num === 0) return '';
                return num.toFixed(2);
            };

            const getValor = (valor: any) => Number(valor) || 0;

            tableData.push([
                '1',
                'SALARIO BASICO',
                formatCantidad(nomina.cantidadDiasBasico || nomina.diasPagados || nomina.dias_pagados),
                formatCurrency(getValor(nomina.valorBasico || nomina.valor_basico)),
                '',
                ''
            ]);

            const valorAux = getValor(nomina.valorAuxTransporte || nomina.valor_auxilio_transporte);
            tableData.push([
                '2',
                'AUXILIO DE TRANSPORTE',
                formatCantidad(valorAux > 0 ? (nomina.diasPagados || nomina.dias_pagados) : null),
                formatCurrency(valorAux),
                '',
                ''
            ]);

            tableData.push([
                '3',
                'HORA EXTRA DIURNA',
                formatCantidad(nomina.cantidadHEDiurna),
                formatCurrency(getValor(nomina.valorHEDiurna)),
                '',
                ''
            ]);

            tableData.push([
                '4',
                'HORA DOMINICALES O FESTIVAS',
                formatCantidad(nomina.cantidadHEFestiva),
                formatCurrency(getValor(nomina.valorHEFestiva)),
                '',
                ''
            ]);

            const otrosPagosVal = getValor(nomina.otrosPagos);
            let descripcionOtros = 'OTRO DEVENGADO-';
            if (nomina.otrosPagosData && nomina.otrosPagosData.length > 0) {
                const ingresos = nomina.otrosPagosData.filter((op: any) => op.tipo === 'INGRESO');
                if (ingresos.length > 0) {
                    descripcionOtros = `OTRO DEVENGADO- ${ingresos[0].concepto || ''}`;
                }
            }
            tableData.push(['5', descripcionOtros, '', formatCurrency(otrosPagosVal), '', '']);
            tableData.push(['6', 'OTRO DEVENGADO-', '', formatCurrency(0), '', '']);

            tableData.push([
                '7',
                'APORTE A SALUD',
                '',
                '',
                formatCurrency(getValor(nomina.valorSalud || nomina.valor_salud)),
                ''
            ]);

            tableData.push([
                '8',
                'APORTE A PENSION',
                '',
                '',
                formatCurrency(getValor(nomina.valorPension || nomina.valor_pension)),
                ''
            ]);

            const otrasDedVal = getValor(nomina.otrasDeducciones || nomina.otras_deducciones);
            let descripcionDed = 'ABONO PRESTAMO';
            if (nomina.otrosPagosData && nomina.otrosPagosData.length > 0) {
                const deducciones = nomina.otrosPagosData.filter((op: any) => op.tipo === 'DEDUCCION');
                if (deducciones.length > 0) {
                    descripcionDed = deducciones[0].concepto || 'ABONO PRESTAMO';
                }
            }
            tableData.push(['9', descripcionDed, '', '', formatCurrency(otrasDedVal), '']);
            tableData.push(['10', 'OTRA DEDUCCION:', '', '', formatCurrency(0), '']);

            autoTable(doc, {
                startY: 65,
                head: tableHeaders,
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [245, 245, 245],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    fontSize: 8,
                    lineWidth: 0.1,
                    lineColor: [200, 200, 200]
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 85 },
                    2: { cellWidth: 15, halign: 'center' },
                    3: { cellWidth: 28, halign: 'right' },
                    4: { cellWidth: 28, halign: 'right' },
                    5: { cellWidth: 11, halign: 'right' }
                }
            });

            let finalY = (doc as any).lastAutoTable.finalY;

            doc.setDrawColor(200);
            doc.rect(14, finalY, 182, 8);
            doc.setFont('helvetica', 'bold');
            doc.text('TOTALES', 100, finalY + 5.5, { align: 'right' });
            const totalDevengado = Number(nomina.totalDevengado || nomina.total_devengado) || 0;
            const totalDeducciones = Number(nomina.totalDeducciones || nomina.total_deducciones) || 0;
            doc.text(formatCurrency(totalDevengado), 156, finalY + 5.5, { align: 'right' });
            doc.text(formatCurrency(totalDeducciones), 181, finalY + 5.5, { align: 'right' });

            finalY += 12;

            doc.setFillColor(240, 245, 255);
            doc.rect(110, finalY, 86, 10, 'F');
            doc.rect(110, finalY, 86, 10);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('NETO A PAGAR', 115, finalY + 6.5);
            const netoPagar = Number(nomina.netoPagar || nomina.neto_pagar) || 0;
            doc.text(formatCurrency(netoPagar), 194, finalY + 6.5, { align: 'right' });

            const footerY = finalY + 30;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.line(14, footerY, 90, footerY);
            doc.text('FIRMA RECIBIDO / EMPLEADO', 14, footerY + 5);
            doc.text(`${nomina.empleado_nombre || nomina.empleado?.nombre_completo || nomina.empleado?.nombreCompleto || ''}`, 14, footerY + 10);
            doc.setFont('helvetica', 'normal');
            doc.text(`C,C   ${nomina.empleado?.cedula || ''}`, 14, footerY + 15);
            doc.text('Declaro que he recibido a satisfacción los valores aquí expresados.', 14, footerY + 20);
        });

        return doc;
    };

    const exportNominaVouchers = (nominas: any[], filename: string = 'comprobante_nomina') => {
        try {
            const doc = generateNominaVouchers(nominas);
            doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error exporting vouchers:', error);
            throw error;
        }
    };

    return {
        exportToExcel,
        exportToPDF,
        exportNominaVouchers,
        generateNominaVouchers
    };
}

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

    const exportToPDF = (data: any[], columns: ExportColumn[], filename: string, title: string) => {
        try {
            const doc = new jsPDF();

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

    return {
        exportToExcel,
        exportToPDF,
    };
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(private readonly dataSource: DataSource) { }

    /**
     * Tarea programada que se ejecuta el último día de cada mes a las 22:00
     * - Exporta la tabla items a un archivo Excel
     * - Crea una tabla items_YYYY_MM con los datos actuales
     */
    @Cron('0 22 L * *', {
        name: 'export-items-monthly',
        timeZone: 'America/Bogota'
    })
    async handleMonthlyItemsExport() {
        this.logger.log('🕒 Iniciando tarea programada: Exportación mensual de items');

        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const tableName = `items_${year}_${month}`;
            const fileName = `items_${year}_${month}.xlsx`;
            const exportDir = path.join(process.cwd(), 'exports');
            const filePath = path.join(exportDir, fileName);

            // Crear directorio de exportación si no existe
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            // 1. Obtener todos los datos de la tabla items
            this.logger.log('📊 Obteniendo datos de la tabla items...');
            const items = await this.dataSource.query('SELECT * FROM public.items');

            if (!items || items.length === 0) {
                this.logger.warn('⚠️ No hay datos en la tabla items para exportar');
                return;
            }

            // 2. Crear archivo Excel
            this.logger.log(`📝 Creando archivo Excel: ${fileName}`);
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Items');

            // Obtener las columnas de la primera fila
            const columns = Object.keys(items[0]).map(key => ({
                header: key,
                key: key,
                width: 15
            }));

            worksheet.columns = columns;

            // Agregar los datos
            items.forEach(item => {
                worksheet.addRow(item);
            });

            // Aplicar estilo al encabezado
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };

            // Guardar archivo
            await workbook.xlsx.writeFile(filePath);
            this.logger.log(`✅ Archivo Excel creado exitosamente: ${filePath}`);

            // 3. Crear tabla items_YYYY_MM
            this.logger.log(`🗄️ Creando tabla: ${tableName}`);

            // Verificar si la tabla ya existe
            const tableExists = await this.dataSource.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                )
            `, [tableName]);

            if (tableExists[0].exists) {
                this.logger.warn(`⚠️ La tabla ${tableName} ya existe. Se omite la creación.`);
            } else {
                // Crear tabla con la misma estructura que items
                await this.dataSource.query(`
                    CREATE TABLE public.${tableName} AS 
                    SELECT * FROM public.items
                `);
                this.logger.log(`✅ Tabla ${tableName} creada exitosamente con ${items.length} registros`);
            }

            this.logger.log('🎉 Tarea programada completada exitosamente');

        } catch (error) {
            this.logger.error('❌ Error en la tarea programada:', error);
            throw error;
        }
    }

    /**
     * Método manual para ejecutar la tarea (útil para pruebas)
     */
    async executeManually() {
        this.logger.log('🔧 Ejecutando tarea manualmente...');
        await this.handleMonthlyItemsExport();
    }
}

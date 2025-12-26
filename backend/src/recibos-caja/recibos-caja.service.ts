import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateReciboCajaDto } from './dto/create-recibo-caja.dto';

@Injectable()
export class RecibosCajaService {
    constructor(private readonly dataSource: DataSource) { }

    async findAll(empresaId: number, page: number = 1, limit: number = 10, filters?: Record<string, any>) {
        try {
            let query = `
                SELECT
                    codigo,
                    fecha,
                    observacion,
                    tipo,
                    n_tipo,
                    cliente_codigo,
                    instalacion_codigo,
                    nombre,
                    anulado,
                    factura,
                    prefijo,
                    valor,
                    documento,
                    forma_pago,
                    descripcion,
                    nro_nota,
                    valor_nota,
                    id,
                    usuario
                FROM public.view_caja_recibos
                WHERE empresa_id = $1
            `;

            const queryParams: any[] = [empresaId];
            let paramCount = 2;

            // Aplicar filtros
            if (filters) {
                // Filtro de fecha desde
                if (filters.fecha_desde && filters.fecha_desde.trim()) {
                    query += ` AND fecha >= $${paramCount}`;
                    queryParams.push(filters.fecha_desde.trim());
                    paramCount++;
                }

                // Filtro de fecha hasta
                if (filters.fecha_hasta && filters.fecha_hasta.trim()) {
                    query += ` AND fecha <= $${paramCount}`;
                    queryParams.push(filters.fecha_hasta.trim());
                    paramCount++;
                }

                // Filtro de código
                if (filters.codigo && filters.codigo.trim()) {
                    query += ` AND codigo::text ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.codigo.trim()}%`);
                    paramCount++;
                }

                // Filtro de instalación
                if (filters.instalacion_codigo && filters.instalacion_codigo.trim()) {
                    query += ` AND instalacion_codigo::text ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.instalacion_codigo.trim()}%`);
                    paramCount++;
                }

                // Filtro de nombre
                if (filters.nombre && filters.nombre.trim()) {
                    query += ` AND nombre ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.nombre.trim()}%`);
                    paramCount++;
                }

                // Filtro de factura
                if (filters.factura && filters.factura.trim()) {
                    query += ` AND factura ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.factura.trim()}%`);
                    paramCount++;
                }

                // Filtro de documento
                if (filters.documento && filters.documento.trim()) {
                    query += ` AND documento ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.documento.trim()}%`);
                    paramCount++;
                }

                // Filtro de tipo recibo
                if (filters.n_tipo && filters.n_tipo.trim()) {
                    query += ` AND n_tipo ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.n_tipo.trim()}%`);
                    paramCount++;
                }
            }

            query += ` ORDER BY codigo DESC`;

            // Obtener total de registros
            const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
            const totalResult = await this.dataSource.query(countQuery, queryParams);
            const total = parseInt(totalResult[0].count);

            // Agregar paginación
            if (limit > 0) {
                query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
                queryParams.push(limit, (page - 1) * limit);
            }

            const data = await this.dataSource.query(query, queryParams);
            console.log('data', data);
            return {
                data,
                total,
                page,
                limit
            };
        } catch (error) {
            console.error('Error al obtener recibos de caja:', error);
            throw new Error(`Error al obtener recibos de caja: ${error.message}`);
        }
    }

    async create(createReciboCajaDto: CreateReciboCajaDto, empresaId: number, usuario: string) {
        // Separar prefijo y factura
        let prefijo = createReciboCajaDto.prefijo || null;
        let factura = createReciboCajaDto.factura;

        // Si no viene prefijo separado, intentar extraerlo del campo factura
        if (!prefijo && factura && factura.includes('-')) {
            const parts = factura.split('-');
            if (parts.length === 2) {
                prefijo = parts[0].trim();
                factura = parts[1].trim();
            }
        }

        const query = `
            INSERT INTO public.caja_recibos
            (fecha, observacion, tipo, instalacion_codigo, factura, prefijo, valor, documento, forma_pago, nro_nota, valor_nota, banco, empresa_id, usuario)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, NULL, NULL, $10, $11)
            RETURNING *
        `;

        const params = [
            createReciboCajaDto.fecha,
            createReciboCajaDto.observacion || '',
            createReciboCajaDto.tipo,
            createReciboCajaDto.instalacion_codigo,
            factura,
            prefijo,
            createReciboCajaDto.valor,
            createReciboCajaDto.documento || '',
            createReciboCajaDto.forma_pago,
            empresaId,
            usuario
        ];

        try {
            const result = await this.dataSource.query(query, params);
            return {
                success: true,
                message: 'Recibo de caja creado exitosamente',
                data: result[0]
            };
        } catch (error) {
            console.error('Error al crear recibo de caja:', error);
            throw new Error(`Error al crear recibo de caja: ${error.message}`);
        }
    }

    async anular(id: number, empresaId: number) {
        const query = `
            UPDATE public.caja_recibos
            SET activo = false
            WHERE empresa_id = $1 AND id = $2
            RETURNING *
        `;

        try {
            const result = await this.dataSource.query(query, [empresaId, id]);

            if (result.length === 0) {
                throw new Error('Recibo no encontrado o no pertenece a esta empresa');
            }

            return {
                success: true,
                message: 'Recibo anulado exitosamente',
                data: result[0]
            };
        } catch (error) {
            console.error('Error al anular recibo de caja:', error);
            throw new Error(`Error al anular recibo de caja: ${error.message}`);
        }
    }
}

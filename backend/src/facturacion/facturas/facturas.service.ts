import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class FacturasService {
    constructor(private readonly dataSource: DataSource) { }

    async findAll(
        empresaId: number,
        page: number = 1,
        limit: number = 20,
        mes?: number,
        year?: number,
        filters?: Record<string, any>
    ) {
        // Si no se proporciona mes o year, usar los valores actuales
        const currentDate = new Date();
        const filterMes = mes || currentDate.getMonth() + 1;
        const filterYear = year || currentDate.getFullYear();

        console.log('\n=== FACTURAS SERVICE ===');
        console.log('Empresa ID:', empresaId);
        console.log('Page:', page, 'Limit:', limit);
        console.log('Filtros por columna:', filters);
        console.log('Mes filtro:', filterMes, 'Year filtro:', filterYear);

        try {
            let query = `
                SELECT mes, year,prefijo,factura,nombre,ident,suscriptor,instalacion_codigo,consumo
                ,estrato_codigo as estrato,
                cargo_fijo,basico,complementario,suntuario,
                valor_subsidio_cargo_fijo,valor_subsidio_consumo,saldo_anterior,total_otros_cobros, total_total,
                 recargos as interes,
                valor_sub_complementario,valor_sub_suntuario,capital_saldo_anterior,interes_capital_saldo_anterior,interes_pago_extemporaneo,
                cuota_conexion,cuota_medidor,valor_total,saldo,valor_basico,valor_complementario,valor_suntuario,
                cuentas_vencidas,otros_cobros,subsidio_cargo_fijo,subsidio_consumo,
                interes_medidor,
                interes_conexion,
                lectura,
                saldo_conexion,
                saldo_medidor,
                cuota_diferido,
                saldo_diferido,
                reconexion,
                valor_metros,
                total_agua,
                total_neto,
                sin_recargo,
                con_recargo,
                consumo_desde,
                consumo_hasta,
                dias_facturados,
                fecha_factura,
                lec_ant,
                nota_cuentas_vencidas,
                total_mes,
                email,
                ajuste_a_centenas,
                telefono,
                uso_nombre,
                ciudad_nombre,
                direccion,
                sector_nombre,
                codigo_medidor, fecha
                FROM view_facturas
                WHERE empresa_id = $1
                AND mes = $2
                AND year = $3
            `;

            const queryParams: any[] = [empresaId, filterMes, filterYear];
            let paramCount = 4;

            // Aplicar filtros por columna
            if (filters) {
                if (filters.factura && filters.factura.trim()) {
                    query += ` AND factura::text ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.factura.trim()}%`);
                    paramCount++;
                }

                if (filters.nombre && filters.nombre.trim()) {
                    query += ` AND nombre ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.nombre.trim()}%`);
                    paramCount++;
                }

                if (filters.ident && filters.ident.trim()) {
                    query += ` AND ident ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.ident.trim()}%`);
                    paramCount++;
                }

                if (filters.instalacion_codigo && filters.instalacion_codigo.trim()) {
                    query += ` AND instalacion_codigo::text ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.instalacion_codigo.trim()}%`);
                    paramCount++;
                }

                if (filters.direccion && filters.direccion.trim()) {
                    query += ` AND direccion ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.direccion.trim()}%`);
                    paramCount++;
                }

                if (filters.ciudad_nombre && filters.ciudad_nombre.trim()) {
                    query += ` AND ciudad_nombre ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.ciudad_nombre.trim()}%`);
                    paramCount++;
                }

                if (filters.sector_nombre && filters.sector_nombre.trim()) {
                    query += ` AND sector_nombre ILIKE $${paramCount}`;
                    queryParams.push(`%${filters.sector_nombre.trim()}%`);
                    paramCount++;
                }
            }

            // Obtener el total de registros
            const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
            const totalResult = await this.dataSource.query(countQuery, queryParams);
            const total = parseInt(totalResult[0].count);

            // Agregar ordenamiento y paginación
            query += ` ORDER BY factura DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            queryParams.push(limit, (page - 1) * limit);

            console.log('\n=== CONSULTA FINAL ===');
            console.log('Query:', query);
            console.log('Params:', queryParams);

            const data = await this.dataSource.query(query, queryParams);

            console.log('Registros encontrados:', data.length);
            console.log('Total:', total);

            return {
                data,
                total,
                page,
                limit,
            };
        } catch (error) {
            console.error('\n=== ERROR EN FACTURAS SERVICE ===');
            console.error('Error completo:', error);
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            throw new Error(`Error al obtener facturas: ${error.message}`);
        }
    }
}

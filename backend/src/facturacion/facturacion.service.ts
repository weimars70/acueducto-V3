import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface ValidarPrefacturasDto {
    empresaId: number;
    mes: number;
    year: number;
}

export interface GenerarFacturasDto {
    empresaId: number;
    mes: number;
    year: number;
    sin_recargo: string;
    con_recargo: string;
    consumo_desde: string;
    consumo_hasta: string;
    fecha_factura: string;
}

@Injectable()
export class FacturacionService {
    constructor(
        private readonly dataSource: DataSource
    ) { }

    /**
     * Valida que existan prefacturas para el mes y año especificados
     */
    async validarPrefacturas(dto: ValidarPrefacturasDto): Promise<any> {
        const { empresaId, mes, year } = dto;

        try {
            // Buscar prefacturas con prefijo 'PR' para el mes y año
            const prefacturas = await this.dataSource.query(
                `SELECT COUNT(*) as total
                 FROM facturas
                 WHERE empresa_id = $1
                   AND mes = $2
                   AND year = $3
                   AND prefijo = 'PR'`,
                [empresaId, mes, year]
            );

            const cantidad = parseInt(prefacturas[0].total);

            return {
                existenPrefacturas: cantidad > 0,
                cantidad: cantidad
            };

        } catch (error: any) {
            console.error('❌ [Facturación] Error al validar prefacturas:', error);
            throw new HttpException(
                `Error al validar prefacturas: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Genera facturas definitivas a partir de las prefacturas
     */
    async generarFacturas(dto: GenerarFacturasDto, usuario: string): Promise<any> {
        const { empresaId, mes, year, sin_recargo, con_recargo, consumo_desde, consumo_hasta, fecha_factura } = dto;

        console.log('📋 [Facturación] Iniciando generación de facturas:', { empresaId, mes, year, usuario });

        try {
            // 1. Validar que existan prefacturas
            const validacion = await this.validarPrefacturas({ empresaId, mes, year });

            if (!validacion.existenPrefacturas) {
                throw new HttpException(
                    'No existen prefacturas para el mes y año seleccionados',
                    HttpStatus.NOT_FOUND
                );
            }

            console.log(`✅ [Facturación] Se encontraron ${validacion.cantidad} prefacturas para procesar`);

            // 2. Llamar a la función de PostgreSQL generar_facturacion_mensual
            const result = await this.dataSource.query(
                `SELECT generar_facturacion_mensual($1, $2, $3, $4, $5, $6, $7, $8, $9) as resultado`,
                [mes, year, sin_recargo, con_recargo, consumo_desde, consumo_hasta, fecha_factura, usuario, empresaId]
            );

            console.log('📝 [Facturación] Resultado de la función:', result);

            // 3. Evaluar el resultado de la función
            if (!result || result.length === 0 || !result[0].resultado) {
                throw new HttpException(
                    'Error al generar facturas: La función de facturación no completó correctamente',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            console.log(`✅ [Facturación] Facturas generadas exitosamente: ${validacion.cantidad} registros`);

            return {
                success: true,
                message: 'Facturación exitosa',
                cantidad: validacion.cantidad
            };

        } catch (error: any) {
            console.error('❌ [Facturación] Error al generar facturas:', error);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                `Error al generar facturas: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}

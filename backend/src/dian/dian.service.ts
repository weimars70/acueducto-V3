import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';

export interface EnviarDianDto {
    empresaId: number;
    year: number;
    mes: number;
    nroInicial?: number;
    nroFinal?: number;
}

export interface DianResultado {
    prefijo: string;
    factura: number;
    success: boolean;
    error?: string;
}

@Injectable()
export class DianService {
    private readonly DIAN_API_URL = 'http://108.181.193.178:81/apidian2/public/api/ubl2.1/eqdoc';
    private readonly DIAN_TOKEN = '830b6616b1b2c93bc67efdc972389c0503e46077fe0751333934fd2acd4afc57';

    // Almacenamiento temporal del progreso por empresa
    private progressMap = new Map<string, { actual: number; total: number; porcentaje: number }>();

    constructor(
        private readonly dataSource: DataSource,
        private readonly httpService: HttpService
    ) { }

    /**
     * Envía facturas a la DIAN para un rango de instalaciones
     */
    async enviarFacturasDian(dto: EnviarDianDto): Promise<any> {
        const { empresaId, year, mes, nroInicial, nroFinal } = dto;

        //console.log('📤 [DIAN] Iniciando envío:', { empresaId, year, mes, nroInicial, nroFinal });

        try {
            // 1. Obtener lista de facturas en el rango
            let query = `
                SELECT prefijo, codigo AS factura
                FROM facturas a
                WHERE a.empresa_id = $1
                  AND a.mes = $2
                  AND a.year = $3
            `;
            const params: any[] = [empresaId, mes, year];

            // Agregar filtro de instalaciones solo si se especifican
            if (nroInicial && nroFinal) {
                query += ` AND a.instalacion_codigo BETWEEN $4 AND $5`;
                params.push(nroInicial, nroFinal);
            }

            query += ` ORDER BY a.instalacion_codigo`;

            const facturas = await this.dataSource.query(query, params);

            if (facturas.length === 0) {
                throw new HttpException(
                    'No se encontraron facturas para los criterios seleccionados',
                    HttpStatus.NOT_FOUND
                );
            }

            //console.log(`📋 [DIAN] Se encontraron ${facturas.length} facturas para procesar`);

            const resultados: DianResultado[] = [];
            let exitosas = 0;
            let fallidas = 0;

            // Inicializar progreso
            const progressKey = `${empresaId}-${year}-${mes}`;
            this.progressMap.set(progressKey, { actual: 0, total: facturas.length, porcentaje: 0 });

            // 2. Procesar cada factura
            for (let i = 0; i < facturas.length; i++) {
                const factura = facturas[i];
                try {
                    const resultado = await this.procesarFactura(factura.prefijo, factura.factura);
                    resultados.push({
                        prefijo: factura.prefijo,
                        factura: factura.factura,
                        success: true
                    });
                    exitosas++;
                    //console.log(`✅ [DIAN] Factura ${factura.prefijo}-${factura.factura} enviada exitosamente`);
                } catch (error: any) {
                    // Extraer mensaje de error detallado de la API de DIAN
                    let errorMessage = error.message || 'Error desconocido';

                    // Si el error viene de la API de DIAN (error 422, etc.)
                    if (error.response?.data) {
                        const dianError = error.response.data;
                        if (typeof dianError === 'string') {
                            errorMessage = dianError;
                        } else if (dianError.message) {
                            errorMessage = dianError.message;
                        } else if (dianError.errors) {
                            // Si hay errores de validación específicos
                            const errorsArray = Array.isArray(dianError.errors)
                                ? dianError.errors
                                : Object.values(dianError.errors);
                            errorMessage = errorsArray.join(', ');
                        } else {
                            errorMessage = JSON.stringify(dianError);
                        }
                    }

                    resultados.push({
                        prefijo: factura.prefijo,
                        factura: factura.factura,
                        success: false,
                        error: errorMessage
                    });
                    fallidas++;
                    //console.error(`❌ [DIAN] Error en factura ${factura.prefijo}-${factura.factura}:`, errorMessage);
                    //console.error(`❌ [DIAN] Error completo:`, error.response?.data || error);
                }

                // Actualizar progreso después de cada factura
                const actual = i + 1;
                const porcentaje = Math.round((actual / facturas.length) * 100);
                this.progressMap.set(progressKey, { actual, total: facturas.length, porcentaje });

                // Liberar event loop después de cada factura
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            // Limpiar progreso
            this.progressMap.delete(progressKey);

            return {
                total: facturas.length,
                procesadas: facturas.length,
                exitosas,
                fallidas,
                resultados
            };

        } catch (error: any) {
            console.error('❌ [DIAN] Error general:', error);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                `Error al procesar facturas: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Obtiene el progreso actual del procesamiento
     */
    async getProgress(empresaId: number, year: number, mes: number): Promise<any> {
        const progressKey = `${empresaId}-${year}-${mes}`;
        const progress = this.progressMap.get(progressKey);

        if (!progress) {
            return { actual: 0, total: 0, porcentaje: 0, enProceso: false };
        }

        return { ...progress, enProceso: true };
    }

    /**
     * Procesa una factura individual enviándola a la DIAN
     */
    private async procesarFactura(prefijo: string, factura: number): Promise<void> {
        // 1. Obtener datos de la factura desde la vista
        const facturaData = await this.dataSource.query(
            `SELECT factura, type_document_id, type_operation_id, current_date as fecha, hora, resolucion,
                    last_valid_payment_date, stratum_id, type_spd_id, office_lending_company, contract_number,
                    issue_date, party_name, street_name, additional_street_name, municipality_id, stratum, email,
                    duration_of_the_billing_cycle, total_metered_unit_id, total_metered_quantity,
                    consumption_payable_amount, consumption_price_quantity, partial_line_extension_amount,
                    instalacion_codigo, utiliy_meter, consumption_history, customer, legal_monetary_totals,
                    invoice_lines, allowance_charges
             FROM public.view_facturas_dian
             WHERE prefijo = $1 AND factura = $2`,
            [prefijo, factura]
        );
        //console.log('Factura Data:', facturaData);
        if (facturaData.length === 0) {
            throw new Error(`No se encontró información en view_facturas_dian para ${prefijo}-${factura}`);
        }

        const rs = facturaData[0];
        //console.log('Factura Data Rs:', rs);
        // 2. Construir payload para DIAN
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toTimeString().split(' ')[0];

        const taxTotals = [
            {
                tax_id: 1,
                tax_amount: 0.00,
                taxable_amount: rs.partial_line_extension_amount,
                percent: 0.00
            }
        ];

        const data = {
            number: factura,
            type_document_id: 24,
            type_operation_id: 28,
            date: date,
            time: time,
            resolution_number: 'SSP',
            prefix: prefijo,
            notes: ".",
            sendmail: true,
            sendmailtome: true,
            foot_note: ".",
            last_valid_payment_date: this.formatDate(rs.last_valid_payment_date),
            payment_reference: `SOCORRO-${rs.contract_number}`,
            stratum_id: rs.stratum_id,
            software_manufacturer: {
                name: "WEIMAR SANCHEZ GAVIRIA",
                business_name: "UNIT SOLUTIONS",
                software_name: "WPOSACDTO"
            },
            spd: [
                {
                    agency_information: {
                        type_spd_id: rs.type_spd_id,
                        office_lending_company: rs.office_lending_company,
                        contract_number: rs.contract_number,
                        issue_date: this.formatYearMonth(rs.issue_date),
                        note: "."
                    },
                    subscriber_party: {
                        party_name: rs.party_name,
                        street_name: rs.street_name,
                        additional_street_name: rs.additional_street_name,
                        municipality_id: rs.municipality_id,
                        stratum: rs.stratum,
                        email: rs.email
                    },
                    subscriber_consumption: {
                        duration_of_the_billing_cycle: rs.duration_of_the_billing_cycle,
                        consumption_section_note: "consumo",
                        total_metered_unit_id: rs.total_metered_unit_id,
                        total_metered_quantity: rs.total_metered_quantity,
                        consumption_payable_amount: rs.consumption_payable_amount,
                        consumption_price_quantity: rs.consumption_price_quantity,
                        partial_line_extension_amount: rs.partial_line_extension_amount,
                        utiliy_meter: this.parseJsonField(rs.utiliy_meter),
                        consumption_history: this.ensureArray(rs.consumption_history)
                    }
                }
            ],
            customer: this.parseJsonField(rs.customer),
            legal_monetary_totals: this.parseJsonField(rs.legal_monetary_totals),
            tax_totals: taxTotals,
            invoice_lines: this.parseJsonField(rs.invoice_lines)
        };

        // 3. Enviar a DIAN
        const response = await firstValueFrom(
            this.httpService.post(this.DIAN_API_URL, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.DIAN_TOKEN}`
                },
                timeout: 30000 // 30 segundos de timeout
            })
        );

        // 4. Extraer solo la información relevante de la respuesta para ahorrar espacio
        const dianResponse = response.data;
        const responseResumen = {
            success: true,
            timestamp: new Date().toISOString(),
            cufe: dianResponse?.cufe || dianResponse?.cude || null,
            message: dianResponse?.message || dianResponse?.StatusDescription || 'Enviado exitosamente',
            statusCode: dianResponse?.StatusCode || dianResponse?.status || null,
            zip_key: dianResponse?.zip_key || null,
            errors: dianResponse?.errors || null
        };

        // Guardar solo el resumen en lugar de toda la respuesta
        const responseJson = JSON.stringify(responseResumen);
        await this.dataSource.query(
            `UPDATE facturas SET rep_dian = $1 WHERE prefijo = $2 AND codigo = $3`,
            [responseJson, prefijo, factura]
        );
    }

    /**
     * Helper para parsear campos JSON
     */
    private parseJsonField(field: any): any {
        if (!field) return null;
        if (typeof field === 'string') {
            try {
                return JSON.parse(field);
            } catch (e) {
                return field;
            }
        }
        return field;
    }

    /**
     * Helper para formatear fecha al formato YYYY-MM-DD requerido por DIAN
     */
    private formatDate(date: any): string {
        if (!date) return new Date().toISOString().split('T')[0];

        try {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                return new Date().toISOString().split('T')[0];
            }
            return dateObj.toISOString().split('T')[0];
        } catch (e) {
            return new Date().toISOString().split('T')[0];
        }
    }

    /**
     * Helper para formatear fecha al formato YYYY-MM (sin día) para issue_date
     */
    private formatYearMonth(date: any): string {
        if (!date) {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }

        try {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                const now = new Date();
                return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            }
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            return `${year}-${month}`;
        } catch (e) {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
    }

    /**
     * Helper para asegurar que consumption_history sea un array válido
     */
    private ensureArray(field: any): any[] {
        const parsed = this.parseJsonField(field);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        if (parsed && typeof parsed === 'object') {
            return [parsed];
        }
        return [];
    }
}

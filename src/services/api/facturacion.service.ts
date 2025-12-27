import { apiClient } from './client';

export interface ValidarPrefacturasDto {
    empresaId: number;
    mes: number;
    year: number;
}

export interface ValidarPrefacturasResponse {
    existenPrefacturas: boolean;
    cantidad: number;
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

export interface GenerarFacturasResponse {
    success: boolean;
    message: string;
    cantidad: number;
}

export const facturacionService = {
    /**
     * Valida que existan prefacturas para el mes y año especificados
     */
    async validarPrefacturas(data: ValidarPrefacturasDto): Promise<ValidarPrefacturasResponse> {
        const { data: response } = await apiClient.post<ValidarPrefacturasResponse>('/facturacion/validar-prefacturas', data);
        return response;
    },

    /**
     * Genera facturas definitivas a partir de las prefacturas
     */
    async generarFacturas(data: GenerarFacturasDto): Promise<GenerarFacturasResponse> {
        const { data: response } = await apiClient.post<GenerarFacturasResponse>('/facturacion/generar-facturas', data, {
            timeout: 300000 // 5 minutos de timeout
        });
        return response;
    }
};

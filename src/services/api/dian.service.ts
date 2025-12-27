import { apiClient } from './client';

export interface EnviarFacturasDianDto {
    empresaId: number;
    year: number;
    mes: number;
    nroInicial?: number;
    nroFinal?: number;
}

export interface EnviarFacturaUnicaDianDto {
    empresaId: number;
    prefijo: string;
    factura: number;
}

export interface DianResultado {
    prefijo: string;
    factura: number;
    success: boolean;
    error?: string;
}

export interface EnviarFacturasDianResponse {
    total: number;
    procesadas: number;
    exitosas: number;
    fallidas: number;
    resultados: DianResultado[];
}

export interface EnviarFacturaUnicaDianResponse {
    success: boolean;
    message: string;
    prefijo: string;
    factura: number;
    error?: string;
}

export const dianService = {
    /**
     * Envía facturas a la DIAN para un rango de instalaciones
     */
    async enviarFacturasDian(data: EnviarFacturasDianDto): Promise<EnviarFacturasDianResponse> {
        const { data: response } = await apiClient.post<EnviarFacturasDianResponse>('/dian/enviar-facturas', data, {
            timeout: 3600000 // 1 hora de timeout para procesos largos (puede procesar ~1000 facturas)
        });
        return response;
    },

    /**
     * Envía una sola factura a la DIAN
     */
    async enviarFacturaUnicaDian(data: EnviarFacturaUnicaDianDto): Promise<EnviarFacturaUnicaDianResponse> {
        const { data: response } = await apiClient.post<EnviarFacturaUnicaDianResponse>('/dian/enviar-factura-unica', data, {
            timeout: 60000 // 1 minuto de timeout para una sola factura
        });
        return response;
    },

    /**
     * Obtiene el progreso actual del procesamiento
     */
    async getProgress(empresaId: number, year: number, mes: number): Promise<any> {
        const { data } = await apiClient.get('/dian/progress', {
            params: { empresaId, year, mes },
            timeout: 5000 // 5 segundos timeout para progreso
        });
        return data;
    }
};

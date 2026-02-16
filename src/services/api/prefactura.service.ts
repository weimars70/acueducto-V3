import { apiClient } from './client';

export interface GenerarPrefacturaDto {
    mes: number;
    year: number;
}

export const prefacturaService = {
    async getMeses() {
        const { data } = await apiClient.get<any[]>('/prefactura/meses');
        return data;
    },

    async generar(dto: GenerarPrefacturaDto) {
        // Aumentar el tiempo de espera a 10 minutos para esta petición específica
        const { data } = await apiClient.post('/prefactura/generar', dto, {
            timeout: 600000 // 10 minutos (600000 ms)
        });
        return data;
    },

    async verificar(dto: GenerarPrefacturaDto) {
        const { data } = await apiClient.post<{ exists: boolean }>('/prefactura/verificar', dto);
        return data;
    }
};

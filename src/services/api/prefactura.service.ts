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
        const { data } = await apiClient.post('/prefactura/generar', dto);
        return data;
    }
};

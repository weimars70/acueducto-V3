import { apiClient } from './client';
import type { EstratoTarifa, CreateEstratoTarifaDto, UpdateEstratoTarifaDto } from '../../types/estrato-tarifa';

export const estratosTarifasService = {
    async getAll(empresaId?: number): Promise<EstratoTarifa[]> {
        const response = await apiClient.get('/estratos-tarifas', { params: { empresaId } });
        return response.data;
    },

    async getById(codigo: number, tipo: number): Promise<EstratoTarifa> {
        const response = await apiClient.get(`/estratos-tarifas/${codigo}/${tipo}`);
        return response.data;
    },

    async create(data: CreateEstratoTarifaDto): Promise<EstratoTarifa> {
        const response = await apiClient.post('/estratos-tarifas', data);
        return response.data;
    },

    async update(codigo: number, tipo: number, data: UpdateEstratoTarifaDto): Promise<EstratoTarifa> {
        const response = await apiClient.patch(`/estratos-tarifas/${codigo}/${tipo}`, data);
        return response.data;
    },

    async delete(codigo: number, tipo: number): Promise<void> {
        await apiClient.delete(`/estratos-tarifas/${codigo}/${tipo}`);
    }
};

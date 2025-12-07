import { apiClient } from './client';
import type { EstratoTipo, CreateEstratoTipoDto, UpdateEstratoTipoDto } from '../../types/estrato-tipo';

export const estratosTipoService = {
    async getAll(empresaId?: number): Promise<EstratoTipo[]> {
        const response = await apiClient.get('/estratos-tipo', { params: { empresaId } });
        return response.data;
    },

    async getById(codigo: number): Promise<EstratoTipo> {
        const response = await apiClient.get(`/estratos-tipo/${codigo}`);
        return response.data;
    },

    async create(data: CreateEstratoTipoDto): Promise<EstratoTipo> {
        const response = await apiClient.post('/estratos-tipo', data);
        return response.data;
    },

    async update(codigo: number, data: UpdateEstratoTipoDto): Promise<EstratoTipo> {
        const response = await apiClient.patch(`/estratos-tipo/${codigo}`, data);
        return response.data;
    },

    async delete(codigo: number): Promise<void> {
        await apiClient.delete(`/estratos-tipo/${codigo}`);
    }
};

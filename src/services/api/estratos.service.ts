import { apiClient } from './client';
import type { Estrato, CreateEstratoDto, UpdateEstratoDto } from '../../types/estrato';

export const estratosService = {
    async getAll(empresaId?: number): Promise<Estrato[]> {
        const response = await apiClient.get('/estratos', { params: { empresaId } });
        return response.data;
    },

    async getById(codigo: number): Promise<Estrato> {
        const response = await apiClient.get(`/estratos/${codigo}`);
        return response.data;
    },

    async create(data: CreateEstratoDto): Promise<Estrato> {
        const response = await apiClient.post('/estratos', data);
        return response.data;
    },

    async update(codigo: number, data: UpdateEstratoDto): Promise<Estrato> {
        const response = await apiClient.patch(`/estratos/${codigo}`, data);
        return response.data;
    },

    async delete(codigo: number): Promise<void> {
        await apiClient.delete(`/estratos/${codigo}`);
    }
};

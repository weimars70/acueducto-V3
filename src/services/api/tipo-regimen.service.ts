import { apiClient } from './client';
import type { TipoRegimen, CreateTipoRegimenDto, UpdateTipoRegimenDto } from '../../types/tipo-regimen';

export const tipoRegimenService = {
    async getTipoRegimenes(params?: { page?: number; limit?: number; nombre?: string }) {
        const response = await apiClient.get<{ data: TipoRegimen[]; total: number }>('/tipo-regimen', { params });
        return response.data;
    },

    async getByCodigo(codigo: number) {
        const response = await apiClient.get<TipoRegimen>(`/tipo-regimen/${codigo}`);
        return response.data;
    },

    async create(data: CreateTipoRegimenDto) {
        const response = await apiClient.post<TipoRegimen>('/tipo-regimen', data);
        return response.data;
    },

    async update(codigo: number, data: UpdateTipoRegimenDto) {
        const response = await apiClient.put<TipoRegimen>(`/tipo-regimen/${codigo}`, data);
        return response.data;
    },

    async delete(codigo: number) {
        await apiClient.delete(`/tipo-regimen/${codigo}`);
    }
};

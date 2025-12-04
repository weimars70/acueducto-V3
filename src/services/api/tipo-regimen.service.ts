import api from '../api';
import type { TipoRegimen, CreateTipoRegimenDto, UpdateTipoRegimenDto } from '../../types/tipo-regimen';

export const tipoRegimenService = {
    async getTipoRegimenes(params?: { page?: number; limit?: number; nombre?: string }) {
        const response = await api.get<{ data: TipoRegimen[]; total: number }>('/tipo-regimen', { params });
        return response.data;
    },

    async getByCodigo(codigo: number) {
        const response = await api.get<TipoRegimen>(`/tipo-regimen/${codigo}`);
        return response.data;
    },

    async create(data: CreateTipoRegimenDto) {
        const response = await api.post<TipoRegimen>('/tipo-regimen', data);
        return response.data;
    },

    async update(codigo: number, data: UpdateTipoRegimenDto) {
        const response = await api.put<TipoRegimen>(`/tipo-regimen/${codigo}`, data);
        return response.data;
    },

    async delete(codigo: number) {
        await api.delete(`/tipo-regimen/${codigo}`);
    }
};

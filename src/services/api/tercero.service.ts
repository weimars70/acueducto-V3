import { apiClient } from './client';
import type { Tercero, CreateTerceroDto, UpdateTerceroDto } from '../../types/tercero';

export const terceroService = {
    async getAll(params?: { page?: number; limit?: number; nombres?: string; identificacion?: string; cliente?: boolean; proveedor?: boolean }) {
        const response = await apiClient.get<{ data: Tercero[]; total: number; page: number; limit: number }>('/terceros', { params });
        return response.data;
    },

    async getById(codigo: number) {
        const response = await apiClient.get<Tercero>(`/terceros/${codigo}`);
        return response.data;
    },

    async create(data: CreateTerceroDto) {
        const response = await apiClient.post<Tercero>('/terceros', data);
        return response.data;
    },

    async update(codigo: number, data: UpdateTerceroDto) {
        const response = await apiClient.put<Tercero>(`/terceros/${codigo}`, data);
        return response.data;
    },

    async delete(codigo: number) {
        const response = await apiClient.delete(`/terceros/${codigo}`);
        return response.data;
    },
};

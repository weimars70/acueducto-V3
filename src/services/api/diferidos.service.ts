import { apiClient } from './client';
import type { Diferido, CreateDiferidoDto, UpdateDiferidoDto } from '../../types/diferido';

export const diferidosService = {
    async getAll(empresaId?: number): Promise<Diferido[]> {
        const params = empresaId ? { empresaId } : {};
        const response = await apiClient.get<Diferido[]>('/diferidos', { params });
        return response.data;
    },

    async getById(id: number): Promise<Diferido> {
        const response = await apiClient.get<Diferido>(`/diferidos/${id}`);
        return response.data;
    },

    async create(data: CreateDiferidoDto): Promise<Diferido> {
        const response = await apiClient.post<Diferido>('/diferidos', data);
        return response.data;
    },

    async update(id: number, data: UpdateDiferidoDto): Promise<Diferido> {
        const response = await apiClient.patch<Diferido>(`/diferidos/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/diferidos/${id}`);
    }
};

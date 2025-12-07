import { apiClient } from './client';
import type { Sector, CreateSectorDto, UpdateSectorDto } from '../../types/sector';

export const sectoresService = {
    async getAll(): Promise<Sector[]> {
        const response = await apiClient.get<Sector[]>('/sectores');
        return response.data;
    },

    async getById(id: number): Promise<Sector> {
        const response = await apiClient.get<Sector>(`/sectores/${id}`);
        return response.data;
    },

    async create(data: CreateSectorDto): Promise<Sector> {
        const response = await apiClient.post<Sector>('/sectores', data);
        return response.data;
    },

    async update(id: number, data: UpdateSectorDto): Promise<Sector> {
        const response = await apiClient.patch<Sector>(`/sectores/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/sectores/${id}`);
    }
};

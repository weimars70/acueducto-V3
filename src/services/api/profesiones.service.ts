import { apiClient } from './client';
import type { Profesion, CreateProfesionDto, UpdateProfesionDto } from '../../types/profesion';

export const profesionesService = {
    async getAll(): Promise<Profesion[]> {
        const response = await apiClient.get<Profesion[]>('/profesiones');
        return response.data;
    },

    async getById(id: number): Promise<Profesion> {
        const response = await apiClient.get<Profesion>(`/profesiones/${id}`);
        return response.data;
    },

    async create(data: CreateProfesionDto): Promise<Profesion> {
        const response = await apiClient.post<Profesion>('/profesiones', data);
        return response.data;
    },

    async update(id: number, data: UpdateProfesionDto): Promise<Profesion> {
        const response = await apiClient.patch<Profesion>(`/profesiones/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/profesiones/${id}`);
    }
};

import { apiClient } from './client';
import type { Years, CreateYearsDto, UpdateYearsDto } from '../../types/years';

export const yearsService = {
    async getYears(params?: { page?: number; limit?: number }) {
        const response = await apiClient.get<{ data: Years[]; total: number }>('/years', { params });
        return response.data;
    },

    async getByYear(year: number) {
        const response = await apiClient.get<Years>(`/years/${year}`);
        return response.data;
    },

    async create(data: CreateYearsDto) {
        const response = await apiClient.post<Years>('/years', data);
        return response.data;
    },

    async update(year: number, data: UpdateYearsDto) {
        const response = await apiClient.put<Years>(`/years/${year}`, data);
        return response.data;
    },

    async delete(year: number) {
        await apiClient.delete(`/years/${year}`);
    }
};


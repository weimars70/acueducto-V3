import { apiClient } from './client';
import type { Tarifa, CreateTarifaDto, UpdateTarifaDto } from '../../types/tarifa';
import type { PaginatedResponse } from '../../types/api';

export const tarifaService = {
    async getTarifas(params: {
        desde?: string;
        hasta?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Tarifa>> {
        try {
            const { page, limit, ...filters } = params;
            const queryParams = new URLSearchParams();

            if (page !== undefined) {
                queryParams.append('page', page.toString());
            }

            if (limit !== undefined) {
                queryParams.append('limit', limit.toString());
            }

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const { data } = await apiClient.get<PaginatedResponse<Tarifa>>('/tarifas/view', {
                params: queryParams
            });

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getById(id: number): Promise<Tarifa> {
        try {
            const { data } = await apiClient.get<Tarifa>(`/tarifas/${id}`);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async create(tarifa: CreateTarifaDto): Promise<Tarifa> {
        try {
            const { data } = await apiClient.post<Tarifa>('/tarifas', tarifa);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async update(id: number, tarifa: UpdateTarifaDto): Promise<Tarifa> {
        try {
            const { data } = await apiClient.put<Tarifa>(`/tarifas/${id}`, tarifa);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/tarifas/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

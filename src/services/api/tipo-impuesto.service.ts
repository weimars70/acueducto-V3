import { apiClient } from './client';
import type { TipoImpuesto, CreateTipoImpuestoDto, UpdateTipoImpuestoDto } from '../../types/tipo-impuesto';
import type { PaginatedResponse } from '../../types/api';

export const tipoImpuestoService = {
    async getTipoImpuestos(params: {
        nombre?: string;
        codigo?: number;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<TipoImpuesto>> {
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

            const { data } = await apiClient.get<PaginatedResponse<TipoImpuesto>>('/tipo-impuesto/view', {
                params: queryParams
            });

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getByCodigo(codigo: number): Promise<TipoImpuesto> {
        try {
            const { data } = await apiClient.get<TipoImpuesto>(`/tipo-impuesto/${codigo}`);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async create(tipoImpuesto: CreateTipoImpuestoDto): Promise<TipoImpuesto> {
        try {
            const { data } = await apiClient.post<TipoImpuesto>('/tipo-impuesto', tipoImpuesto);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async update(codigo: number, tipoImpuesto: UpdateTipoImpuestoDto): Promise<TipoImpuesto> {
        try {
            const { data } = await apiClient.put<TipoImpuesto>(`/tipo-impuesto/${codigo}`, tipoImpuesto);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async delete(codigo: number): Promise<void> {
        try {
            await apiClient.delete(`/tipo-impuesto/${codigo}`);
        } catch (error) {
            throw error;
        }
    }
};

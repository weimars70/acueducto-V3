import { apiClient } from './client';
import type { TipoIdent, CreateTipoIdentDto, UpdateTipoIdentDto } from '../../types/tipo-ident';
import type { PaginatedResponse } from '../../types/api';

export const tipoIdentService = {
    async getTipoIdents(params: {
        nombre?: string;
        codigo?: number;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<TipoIdent>> {
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

            const { data } = await apiClient.get<PaginatedResponse<TipoIdent>>('/tipo-ident/view', {
                params: queryParams
            });

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getByCodigo(codigo: number): Promise<TipoIdent> {
        try {
            const { data } = await apiClient.get<TipoIdent>(`/tipo-ident/${codigo}`);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async create(tipoIdent: CreateTipoIdentDto): Promise<TipoIdent> {
        try {
            const { data } = await apiClient.post<TipoIdent>('/tipo-ident', tipoIdent);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async update(codigo: number, tipoIdent: UpdateTipoIdentDto): Promise<TipoIdent> {
        try {
            const { data } = await apiClient.put<TipoIdent>(`/tipo-ident/${codigo}`, tipoIdent);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async delete(codigo: number): Promise<void> {
        try {
            await apiClient.delete(`/tipo-ident/${codigo}`);
        } catch (error) {
            throw error;
        }
    }
};

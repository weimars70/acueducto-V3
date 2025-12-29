import { apiClient } from './client';
import type { TipoPersona, CreateTipoPersonaDto, UpdateTipoPersonaDto } from '../../types/tipo-persona';

export const tipoPersonaService = {
    async getAll(empresaId?: number): Promise<TipoPersona[]> {
        const params: any = {};
        if (empresaId) params.empresaId = empresaId;
        const response = await apiClient.get<TipoPersona[]>('/tipo-persona', { params });
        return response.data;
    },

    async getByCodigo(codigo: number) {
        const response = await apiClient.get<TipoPersona>(`/tipo-persona/${codigo}`);
        return response.data;
    },

    async create(data: CreateTipoPersonaDto) {
        const response = await apiClient.post<TipoPersona>('/tipo-persona', data);
        return response.data;
    },

    async update(codigo: number, data: UpdateTipoPersonaDto) {
        const response = await apiClient.put<TipoPersona>(`/tipo-persona/${codigo}`, data);
        return response.data;
    },

    async delete(codigo: number) {
        await apiClient.delete(`/tipo-persona/${codigo}`);
    }
};

import { apiClient } from './client';
import type { NotaDebito, CreateNotaDebitoDto, UpdateNotaDebitoDto } from '@/types/nota-debito';

export const notaDebitoService = {
    async getAll(empresaId?: number): Promise<NotaDebito[]> {
        const params = empresaId ? { empresaId } : {};
        const response = await apiClient.get<NotaDebito[]>('/notas-debito', { params });
        return response.data;
    },

    async getOne(codigo: number, empresaId: number): Promise<NotaDebito> {
        const response = await apiClient.get<NotaDebito>(`/notas-debito/${codigo}/${empresaId}`);
        return response.data;
    },

    async create(data: CreateNotaDebitoDto): Promise<NotaDebito> {
        const response = await apiClient.post<NotaDebito>('/notas-debito', data);
        return response.data;
    },

    async update(codigo: number, empresaId: number, data: UpdateNotaDebitoDto): Promise<NotaDebito> {
        const response = await apiClient.patch<NotaDebito>(`/notas-debito/${codigo}/${empresaId}`, data);
        return response.data;
    },

    async delete(codigo: number, empresaId: number): Promise<void> {
        await apiClient.delete(`/notas-debito/${codigo}/${empresaId}`);
    },
};

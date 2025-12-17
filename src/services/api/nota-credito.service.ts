import { apiClient } from './client';
import type { NotaCredito, CreateNotaCreditoDto, UpdateNotaCreditoDto } from '@/types/nota-credito';

export const notaCreditoService = {
  async getAll(empresaId?: number): Promise<NotaCredito[]> {
    const params = empresaId ? { empresaId } : {};
    const response = await apiClient.get<NotaCredito[]>('/notas-credito', { params });
    return response.data;
  },

  async getOne(codigo: number, empresaId: number): Promise<NotaCredito> {
    const response = await apiClient.get<NotaCredito>(`/notas-credito/${codigo}/${empresaId}`);
    return response.data;
  },

  async create(data: CreateNotaCreditoDto): Promise<NotaCredito> {
    const response = await apiClient.post<NotaCredito>('/notas-credito', data);
    return response.data;
  },

  async update(codigo: number, empresaId: number, data: UpdateNotaCreditoDto): Promise<NotaCredito> {
    const response = await apiClient.patch<NotaCredito>(`/notas-credito/${codigo}/${empresaId}`, data);
    return response.data;
  },

  async delete(codigo: number, empresaId: number): Promise<void> {
    await apiClient.delete(`/notas-credito/${codigo}/${empresaId}`);
  },
};

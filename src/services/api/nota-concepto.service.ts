import { apiClient } from './client';
import type {
  NotaConcepto,
  CreateNotaConceptoDto,
  UpdateNotaConceptoDto,
} from '../../types/nota-concepto';

export const notaConceptoService = {
  async getAll(): Promise<NotaConcepto[]> {
    const { data } = await apiClient.get<NotaConcepto[]>('/notas-conceptos');
    return data;
  },

  async getById(codigo: number): Promise<NotaConcepto> {
    const { data } = await apiClient.get<NotaConcepto>(
      `/notas-conceptos/${codigo}`,
    );
    return data;
  },

  async create(dto: CreateNotaConceptoDto): Promise<NotaConcepto> {
    const { data } = await apiClient.post<NotaConcepto>('/notas-conceptos', dto);
    return data;
  },

  async update(
    codigo: number,
    dto: UpdateNotaConceptoDto,
  ): Promise<NotaConcepto> {
    const { data } = await apiClient.patch<NotaConcepto>(
      `/notas-conceptos/${codigo}`,
      dto,
    );
    return data;
  },

  async delete(codigo: number): Promise<void> {
    await apiClient.delete(`/notas-conceptos/${codigo}`);
  },
};

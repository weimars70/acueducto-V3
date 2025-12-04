import { apiClient } from './client';
import type { Impuesto, CreateImpuestoDto, UpdateImpuestoDto } from '../../types/impuesto';

export const impuestoService = {
  async getByEmpresa(empresaId: number): Promise<Impuesto[]> {
    try {
      const { data } = await apiClient.get<Impuesto[]>(`/impuestos`, {
        params: { empresaId }
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getById(id: number): Promise<Impuesto> {
    try {
      const { data } = await apiClient.get<Impuesto>(`/impuestos/${id}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async create(impuesto: CreateImpuestoDto): Promise<Impuesto> {
    try {
      const { data } = await apiClient.post<Impuesto>('/impuestos', impuesto);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async update(id: number, impuesto: UpdateImpuestoDto): Promise<Impuesto> {
    try {
      const { data } = await apiClient.put<Impuesto>(`/impuestos/${id}`, impuesto);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/impuestos/${id}`);
    } catch (error) {
      throw error;
    }
  }
};

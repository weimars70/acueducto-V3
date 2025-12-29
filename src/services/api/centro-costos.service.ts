import { apiClient } from './client';
import type { CentroCostos, CreateCentroCostosDto, UpdateCentroCostosDto } from '../../types/centro-costos';

export const centroCostosService = {
  async getAll(empresaId?: number): Promise<CentroCostos[]> {
    try {
      const params: any = {};
      if (empresaId) params.empresaId = empresaId;
      const { data } = await apiClient.get<CentroCostos[]>(`/centro-costos`, { params });
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getByEmpresa(empresaId: number): Promise<CentroCostos[]> {
    try {
      const { data } = await apiClient.get<CentroCostos[]>(`/centro-costos`, {
        params: { empresaId }
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getById(id: number): Promise<CentroCostos> {
    try {
      const { data } = await apiClient.get<CentroCostos>(`/centro-costos/${id}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async create(centroCostos: CreateCentroCostosDto): Promise<CentroCostos> {
    try {
      const { data } = await apiClient.post<CentroCostos>('/centro-costos', centroCostos);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async update(id: number, centroCostos: UpdateCentroCostosDto): Promise<CentroCostos> {
    try {
      const { data } = await apiClient.put<CentroCostos>(`/centro-costos/${id}`, centroCostos);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/centro-costos/${id}`);
    } catch (error) {
      throw error;
    }
  }
};

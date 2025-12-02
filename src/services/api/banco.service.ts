import { apiClient } from './client';
import type { Banco, CreateBancoDto, UpdateBancoDto } from '../../types/banco';
import type { PaginatedResponse } from '../../types/api';

export const bancoService = {
  async getBancos(params: {
    codigo?: string;
    nombre?: string;
    numero_cuenta?: string;
    activa?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Banco>> {
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

      const { data } = await apiClient.get<PaginatedResponse<Banco>>('/bancos/view', {
        params: queryParams
      });

      return data;
    } catch (error) {
      throw error;
    }
  },

  async getById(id: number): Promise<Banco> {
    try {
      const { data } = await apiClient.get<Banco>(`/bancos/${id}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async create(banco: CreateBancoDto): Promise<Banco> {
    try {
      const { data } = await apiClient.post<Banco>('/bancos', banco);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async update(id: number, banco: UpdateBancoDto): Promise<Banco> {
    try {
      const { data } = await apiClient.put<Banco>(`/bancos/${id}`, banco);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/bancos/${id}`);
    } catch (error) {
      throw error;
    }
  }
};

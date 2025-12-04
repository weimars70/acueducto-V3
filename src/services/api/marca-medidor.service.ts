import { apiClient } from './client';
import type { MarcaMedidor, CreateMarcaMedidorDto, UpdateMarcaMedidorDto } from '../../types/marca-medidor';

export const marcaMedidorService = {
  async getByEmpresa(empresaId: number): Promise<MarcaMedidor[]> {
    try {
      const { data } = await apiClient.get<MarcaMedidor[]>(`/marcas-medidor`, {
        params: { empresaId }
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getByCodigo(codigo: number): Promise<MarcaMedidor> {
    try {
      const { data} = await apiClient.get<MarcaMedidor>(`/marcas-medidor/${codigo}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async create(marca: CreateMarcaMedidorDto): Promise<MarcaMedidor> {
    try {
      const { data } = await apiClient.post<MarcaMedidor>('/marcas-medidor', marca);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async update(codigo: number, marca: UpdateMarcaMedidorDto): Promise<MarcaMedidor> {
    try {
      const { data } = await apiClient.put<MarcaMedidor>(`/marcas-medidor/${codigo}`, marca);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async delete(codigo: number): Promise<void> {
    try {
      await apiClient.delete(`/marcas-medidor/${codigo}`);
    } catch (error) {
      throw error;
    }
  }
};

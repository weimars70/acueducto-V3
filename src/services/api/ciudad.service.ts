import { apiClient } from './client';
import type { Ciudad, CreateCiudadDto, UpdateCiudadDto } from '../../types/ciudad';

export const ciudadService = {
  async getByEmpresa(empresaId: number): Promise<Ciudad[]> {
    try {
      const { data } = await apiClient.get<Ciudad[]>(`/ciudades`, {
        params: { empresaId }
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getByCodigo(codigo: string): Promise<Ciudad> {
    try {
      const { data } = await apiClient.get<Ciudad>(`/ciudades/${codigo}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async create(ciudad: CreateCiudadDto): Promise<Ciudad> {
    try {
      const { data } = await apiClient.post<Ciudad>('/ciudades', ciudad);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async update(codigo: string, ciudad: UpdateCiudadDto): Promise<Ciudad> {
    try {
      const { data } = await apiClient.put<Ciudad>(`/ciudades/${codigo}`, ciudad);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async delete(codigo: string): Promise<void> {
    try {
      await apiClient.delete(`/ciudades/${codigo}`);
    } catch (error) {
      throw error;
    }
  }
};

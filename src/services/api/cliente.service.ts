import { apiClient } from './client';
import type { Cliente, CreateClienteDto, UpdateClienteDto } from '../../types/cliente';

export const clienteService = {
  async getByEmpresa(empresaId: number): Promise<Cliente[]> {
    try {
      const { data } = await apiClient.get<Cliente[]>(`/clientes`, {
        params: { empresaId }
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getByCodigo(codigo: number): Promise<Cliente> {
    try {
      const { data } = await apiClient.get<Cliente>(`/clientes/${codigo}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async create(cliente: CreateClienteDto): Promise<Cliente> {
    try {
      const { data } = await apiClient.post<Cliente>('/clientes', cliente);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async update(codigo: number, cliente: UpdateClienteDto): Promise<Cliente> {
    try {
      const { data } = await apiClient.put<Cliente>(`/clientes/${codigo}`, cliente);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async delete(codigo: number): Promise<void> {
    try {
      await apiClient.delete(`/clientes/${codigo}`);
    } catch (error) {
      throw error;
    }
  }
};

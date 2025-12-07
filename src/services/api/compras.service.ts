import { apiClient } from './client';
import type { Compra, CreateCompraDto, Proveedor, Item } from '../../types/compra';
import type { PaginatedResponse } from '../../types/api';

interface CompraResponse extends PaginatedResponse<Compra> {}

interface CompraFilters {
  page?: number;
  limit?: number;
  factura?: string;
  proveedor_nombre?: string;
  anulado?: boolean;
}

export const compraService = {
  async getCompras(filters: CompraFilters = {}): Promise<CompraResponse> {
    const { data } = await apiClient.get('/compras/view', { params: filters });
    return data;
  },

  async getCompra(codigo: number): Promise<Compra> {
    const { data } = await apiClient.get(`/compras/${codigo}`);
    return data;
  },

  async getProveedores(): Promise<Proveedor[]> {
    const { data } = await apiClient.get('/compras/proveedores');
    return data;
  },

  async getItems(): Promise<Item[]> {
    const { data } = await apiClient.get('/compras/items');
    return data;
  },

  async create(compra: CreateCompraDto): Promise<any> {
    const { data } = await apiClient.post('/compras', compra);
    return data;
  },

  async update(codigo: number, compra: Partial<CreateCompraDto>): Promise<Compra> {
    const { data } = await apiClient.put(`/compras/${codigo}`, compra);
    return data;
  },

  async delete(codigo: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`/compras/${codigo}`);
    return data;
  }
};

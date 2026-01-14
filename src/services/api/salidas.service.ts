import { apiClient } from './client';
import type { Salida } from '../../types/salida';
import type { CreateSalidaDto, Cliente, ItemCatalogo } from '../../types/salida-form';

export const salidasService = {
    async getByEmpresa(empresaId: number): Promise<Salida[]> {
        const response = await apiClient.get<Salida[]>('/salidas', {
            params: { empresaId }
        });
        return response.data;
    },

    async getClientes(): Promise<Cliente[]> {
        const response = await apiClient.get<Cliente[]>('/salidas/clientes');
        return response.data;
    },

    async searchClientes(query: string): Promise<Cliente[]> {
        const response = await apiClient.get<Cliente[]>('/salidas/clientes/search', {
            params: { q: query }
        });
        return response.data;
    },

    async getItems(): Promise<ItemCatalogo[]> {
        const response = await apiClient.get<ItemCatalogo[]>('/salidas/items');
        return response.data;
    },

    async searchItems(query: string): Promise<ItemCatalogo[]> {
        const response = await apiClient.get<ItemCatalogo[]>('/salidas/items/search', {
            params: { q: query }
        });
        return response.data;
    },

    async create(data: CreateSalidaDto): Promise<{ ok: boolean; mensaje: string }> {
        const response = await apiClient.post('/salidas', data);
        return response.data;
    },

    async getDetalles(codigo: string): Promise<any[]> {
        const response = await apiClient.get<any[]>(`/salidas/${codigo}/detalles`);
        return response.data;
    },

    async updateObservacion(codigo: string, observacion: string): Promise<void> {
        await apiClient.patch(`/salidas/${codigo}/observacion`, { observacion });
    }
};

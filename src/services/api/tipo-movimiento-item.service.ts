import { apiClient } from './client';
import type { TipoMovimientoItem, CreateTipoMovimientoItemDto, UpdateTipoMovimientoItemDto } from '../../types/tipo-movimiento-item';

export const tipoMovimientoItemService = {
    async getByEmpresa(empresaId: number): Promise<TipoMovimientoItem[]> {
        try {
            const { data } = await apiClient.get<TipoMovimientoItem[]>(`/tipo-movimiento-item`, {
                params: { empresaId }
            });
            return data;
        } catch (error) {
            throw error;
        }
    },

    async getById(id: number, empresaId: number): Promise<TipoMovimientoItem> {
        try {
            const { data } = await apiClient.get<TipoMovimientoItem>(`/tipo-movimiento-item/${id}`, {
                params: { empresaId }
            });
            return data;
        } catch (error) {
            throw error;
        }
    },

    async create(item: CreateTipoMovimientoItemDto): Promise<TipoMovimientoItem> {
        try {
            const { data } = await apiClient.post<TipoMovimientoItem>('/tipo-movimiento-item', item);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async update(id: number, item: UpdateTipoMovimientoItemDto): Promise<TipoMovimientoItem> {
        try {
            const { data } = await apiClient.put<TipoMovimientoItem>(`/tipo-movimiento-item/${id}`, item);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/tipo-movimiento-item/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

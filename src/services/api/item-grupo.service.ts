import { apiClient } from './client';
import type { ItemGrupo, CreateItemGrupoDto, UpdateItemGrupoDto } from '../../types/item-grupo';

export const itemsGruposService = {
    async getByEmpresa(empresaId: number): Promise<ItemGrupo[]> {
        try {
            const { data } = await apiClient.get<ItemGrupo[]>(`/items-grupos`, {
                params: { empresaId }
            });
            return data;
        } catch (error) {
            throw error;
        }
    },

    async getById(id: number, empresaId: number): Promise<ItemGrupo> {
        try {
            const { data } = await apiClient.get<ItemGrupo>(`/items-grupos/${id}`, {
                params: { empresaId }
            });
            return data;
        } catch (error) {
            throw error;
        }
    },

    async create(item: CreateItemGrupoDto): Promise<ItemGrupo> {
        try {
            const { data } = await apiClient.post<ItemGrupo>('/items-grupos', item);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async update(id: number, item: UpdateItemGrupoDto): Promise<ItemGrupo> {
        try {
            const { data } = await apiClient.put<ItemGrupo>(`/items-grupos/${id}`, item);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/items-grupos/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

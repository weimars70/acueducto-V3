import { apiClient } from './client';
import type { Item, CreateItemDto, UpdateItemDto } from '../../types/item';

export const itemsService = {
    async getByEmpresa(empresaId: number): Promise<Item[]> {
        try {
            const { data } = await apiClient.get<Item[]>(`/items`);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async getById(id: number, empresaId: number): Promise<Item> {
        try {
            const { data } = await apiClient.get<Item>(`/items/${id}`);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async create(item: CreateItemDto): Promise<Item> {
        try {
            const { data } = await apiClient.post<Item>('/items', item);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async update(id: number, item: UpdateItemDto): Promise<Item> {
        try {
            const { data } = await apiClient.put<Item>(`/items/${id}`, item);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async delete(id: number): Promise<void> {
        try {
            await apiClient.delete(`/items/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

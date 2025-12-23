import { apiClient } from './client';
import type { PaginatedResponse } from '../../types/api';

export interface AjusteInventario {
    id: number;
    id_item: number;
    item_codigo: string;
    item_nombre: string;
    tipo_ajuste: string;
    cantidad: number;
    inventario_anterior: number;
    inventario_nuevo: number;
    motivo: string;
    fecha: string;
    usuario: string;
}

export interface CreateAjusteInventarioDto {
    idItem: number;
    tipoAjuste: '+' | '-' | 'inicial';
    cantidad: number;
    motivo?: string;
}

export interface ItemAjusteDto {
    idItem: number;
    cantidad: number;
    motivo?: string;
}

export interface CreateAjusteMultipleDto {
    codigoTipoAjuste: number;
    items: ItemAjusteDto[];
    motivoGeneral?: string;
}

export interface ItemInventario {
    id: number;
    codigo: string;
    nombre: string;
    inventario_actual: number;
}

export interface AjusteFilters {
    page?: number;
    limit?: number;
    itemNombre?: string;
    tipoAjuste?: '+' | '-';
    fechaDesde?: string;
    fechaHasta?: string;
}

export interface Estadisticas {
    total_ajustes: number;
    total_entradas: number;
    total_salidas: number;
}

interface AjusteResponse extends PaginatedResponse<AjusteInventario> { }

export const ajustesInventarioService = {
    async getAjustes(filters: AjusteFilters = {}): Promise<AjusteResponse> {
        const { data } = await apiClient.get('/ajustes-inventario', { params: filters });
        return data;
    },

    async getItems(search?: string): Promise<ItemInventario[]> {
        const { data } = await apiClient.get('/ajustes-inventario/items', { params: { search } });
        return data;
    },

    async getEstadisticas(): Promise<Estadisticas> {
        const { data } = await apiClient.get('/ajustes-inventario/estadisticas');
        return data;
    },

    async create(ajuste: CreateAjusteInventarioDto): Promise<any> {
        const { data } = await apiClient.post('/ajustes-inventario', ajuste);
        return data;
    },

    async createMultiple(ajuste: CreateAjusteMultipleDto): Promise<any> {
        const { data } = await apiClient.post('/ajustes-inventario/multiple', ajuste);
        return data;
    }
};

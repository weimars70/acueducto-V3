import { apiClient } from './client';

export interface TipoAjusteInventario {
    codigo: number;
    nombre: string;
    sumaUnidades: boolean;
    restaUnidades: boolean;
    valorUnidades: boolean;
    activo: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTipoAjusteDto {
    nombre: string;
    sumaUnidades: boolean;
    restaUnidades: boolean;
    valorUnidades: boolean;
    activo?: boolean;
}

export interface UpdateTipoAjusteDto extends Partial<CreateTipoAjusteDto> { }

class TiposAjusteInventarioService {
    async getAll(): Promise<TipoAjusteInventario[]> {
        const response = await apiClient.get('/tipos-ajuste-inventario');
        return response.data;
    }

    async getActivos(): Promise<TipoAjusteInventario[]> {
        const response = await apiClient.get('/tipos-ajuste-inventario/activos');
        return response.data;
    }

    async getOne(codigo: number): Promise<TipoAjusteInventario> {
        const response = await apiClient.get(`/tipos-ajuste-inventario/${codigo}`);
        return response.data;
    }

    async create(data: CreateTipoAjusteDto): Promise<TipoAjusteInventario> {
        const response = await apiClient.post('/tipos-ajuste-inventario', data);
        return response.data;
    }

    async update(codigo: number, data: UpdateTipoAjusteDto): Promise<TipoAjusteInventario> {
        const response = await apiClient.patch(`/tipos-ajuste-inventario/${codigo}`, data);
        return response.data;
    }

    async delete(codigo: number): Promise<void> {
        await apiClient.delete(`/tipos-ajuste-inventario/${codigo}`);
    }
}

export const tiposAjusteInventarioService = new TiposAjusteInventarioService();

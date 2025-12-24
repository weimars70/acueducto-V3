import { apiClient } from './client';
import type { PaginatedResponse } from '../../types/api';

export interface TipoRecibo {
    codigo: number;
    nombre: string;
}

export interface FormaPago {
    codigo: number;
    descripcion: string;
}

export interface ReciboCaja {
    codigo: number;
    fecha: string;
    observacion: string;
    tipo: number;
    n_tipo: string;
    cliente_codigo: number;
    instalacion_codigo: number;
    nombre: string;
    anulado: boolean;
    factura: string;
    valor: number;
    documento: string;
    forma_pago: number;
    descripcion: string;
    nro_nota: string;
    valor_nota: number;
    id: number;
    usuario: string;
}

export interface CreateReciboCaja {
    fecha: string;
    observacion?: string;
    tipo: number;
    instalacion_codigo: number;
    factura: string;
    valor: number;
    documento?: string;
    forma_pago: number;
}

export interface ReciboCajaFilters {
    page?: number;
    limit?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    codigo?: string;
    instalacion_codigo?: string;
    nombre?: string;
    factura?: string;
    documento?: string;
    n_tipo?: string;
}

interface ReciboCajaResponse extends PaginatedResponse<ReciboCaja> { }

export const recibosCajaService = {
    async getTiposRecibo(): Promise<TipoRecibo[]> {
        const { data } = await apiClient.get('/tipos-recibo');
        return data;
    },

    async getFormasPago(): Promise<FormaPago[]> {
        const { data } = await apiClient.get('/formas-pago');
        return data;
    },

    async createRecibo(recibo: CreateReciboCaja): Promise<any> {
        const { data } = await apiClient.post('/recibos-caja', recibo);
        return data;
    },

    async getRecibos(filters: ReciboCajaFilters = {}): Promise<ReciboCajaResponse> {
        const { data } = await apiClient.get('/recibos-caja', {
            params: filters
        });
        return data;
    },

    async anularRecibo(id: number): Promise<any> {
        const { data } = await apiClient.patch(`/recibos-caja/${id}/anular`);
        return data;
    }
};

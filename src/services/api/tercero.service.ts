import { apiClient } from './client';
import type {
    Tercero,
    CreateTerceroDto,
    UpdateTerceroDto,
    TerceroContacto,
    CreateContactoDto,
    UpdateContactoDto
} from '../../types/tercero';

export const terceroService = {
    async getAll(params?: { page?: number; limit?: number; nombre?: string; identificacion?: string; cliente?: boolean; proveedor?: boolean }) {
        const response = await apiClient.get<{ data: Tercero[]; total: number; page: number; limit: number }>('/terceros', { params });
        return response.data;
    },

    async getById(codigo: number) {
        const response = await apiClient.get<Tercero>(`/terceros/${codigo}`);
        return response.data;
    },

    async create(data: CreateTerceroDto) {
        const response = await apiClient.post<Tercero>('/terceros', data);
        return response.data;
    },

    async update(codigo: number, data: UpdateTerceroDto) {
        const response = await apiClient.put<Tercero>(`/terceros/${codigo}`, data);
        return response.data;
    },

    async delete(codigo: number) {
        const response = await apiClient.delete(`/terceros/${codigo}`);
        return response.data;
    },

    // =================== MÉTODOS PARA CONTACTOS ===================

    async getTiposContacto() {
        const response = await apiClient.get<{ codigo: number; nombre: string }[]>('/terceros/select/tipos-contacto');
        return response.data;
    },

    async getContactosByTercero(terceroCodigo: number) {
        const response = await apiClient.get<TerceroContacto[]>(`/terceros/${terceroCodigo}/contactos`);
        return response.data;
    },

    async createContacto(terceroCodigo: number, data: CreateContactoDto) {
        const response = await apiClient.post<TerceroContacto>(`/terceros/${terceroCodigo}/contactos`, data);
        return response.data;
    },

    async updateContacto(codigo: number, data: UpdateContactoDto) {
        const response = await apiClient.put<TerceroContacto>(`/terceros/contactos/${codigo}`, data);
        return response.data;
    },

    async deleteContacto(codigo: number) {
        const response = await apiClient.delete(`/terceros/contactos/${codigo}`);
        return response.data;
    },
};


import { apiClient } from './client';

export interface Instalacion {
    codigo: number;
    codigoMedidor: string;
    nombre: string;
    sector: string;
    direccion: string;
    ciudadCodigo: number;
    empresaId: number;
    estado: string;
    activo: boolean; // Added recently
}

export const instalacionesService = {
    async getAll(empresaId?: number, search?: string): Promise<Instalacion[]> {
        const params: any = {};
        if (empresaId) params.empresaId = empresaId;
        if (search) params.search = search;

        const response = await apiClient.get('/instalaciones/all', { params });
        return response.data;
    },

    async getByCode(codigo: number): Promise<Instalacion> {
        const response = await apiClient.get(`/instalaciones?codigo=${codigo}`);
        return response.data;
    }
};

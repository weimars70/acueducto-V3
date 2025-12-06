
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
    async getAll(empresaId?: number): Promise<Instalacion[]> {
        const response = await apiClient.get('/instalaciones/all', { params: { empresaId } });
        return response.data;
    },

    async getByCode(codigo: number): Promise<Instalacion> {
        const response = await apiClient.get(`/instalaciones?codigo=${codigo}`);
        return response.data;
    }
};

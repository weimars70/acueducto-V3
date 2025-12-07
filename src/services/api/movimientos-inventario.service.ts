import { apiClient } from './client';
import type { MovimientoInventario } from '../../types/movimiento-inventario';

export const movimientosInventarioService = {
    async getAll(empresaId: number): Promise<MovimientoInventario[]> {
        const { data } = await apiClient.get<MovimientoInventario[]>('/movimientos-inventario', {
            params: { empresaId }
        });
        return data;
    }
};

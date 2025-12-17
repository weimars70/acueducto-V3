import { apiClient } from './client';
import type { MovimientoSaldoAFavor, CreateMovimientoSaldoAFavorDto } from '../../types/saldo-a-favor';

export const saldosAFavorService = {
    async getAll(): Promise<MovimientoSaldoAFavor[]> {
        const { data } = await apiClient.get<MovimientoSaldoAFavor[]>('/saldos-a-favor');
        return data;
    },

    async create(data: Partial<CreateMovimientoSaldoAFavorDto>): Promise<MovimientoSaldoAFavor> {
        const { data: response } = await apiClient.post<MovimientoSaldoAFavor>('/saldos-a-favor', data);
        return response;
    }
};

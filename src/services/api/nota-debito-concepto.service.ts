import { apiClient } from './client';
import type {
    NotaDebitoConcepto,
    CreateNotaDebitoConceptoDto,
    UpdateNotaDebitoConceptoDto,
} from '../../types/nota-debito-concepto';

export const notaDebitoConceptoService = {
    async getAll(): Promise<NotaDebitoConcepto[]> {
        const { data } = await apiClient.get<NotaDebitoConcepto[]>('/notas-debito-conceptos');
        return data;
    },

    async getById(codigo: number): Promise<NotaDebitoConcepto> {
        const { data } = await apiClient.get<NotaDebitoConcepto>(
            `/notas-debito-conceptos/${codigo}`,
        );
        return data;
    },

    async create(dto: CreateNotaDebitoConceptoDto): Promise<NotaDebitoConcepto> {
        const { data } = await apiClient.post<NotaDebitoConcepto>('/notas-debito-conceptos', dto);
        return data;
    },

    async update(
        codigo: number,
        dto: UpdateNotaDebitoConceptoDto,
    ): Promise<NotaDebitoConcepto> {
        const { data } = await apiClient.patch<NotaDebitoConcepto>(
            `/notas-debito-conceptos/${codigo}`,
            dto,
        );
        return data;
    },

    async delete(codigo: number): Promise<void> {
        await apiClient.delete(`/notas-debito-conceptos/${codigo}`);
    },
};

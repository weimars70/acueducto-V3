import { apiClient } from './client';
import type { ConceptoFactura, CreateConceptoFacturaDto, UpdateConceptoFacturaDto } from '../../types/concepto-factura';

export const conceptoFacturaService = {
    async getAll(empresaId?: number): Promise<ConceptoFactura[]> {
        const params = empresaId ? { empresaId } : {};
        const response = await apiClient.get<ConceptoFactura[]>('/conceptos-factura', { params });
        return response.data;
    },

    async getById(id: number): Promise<ConceptoFactura> {
        const response = await apiClient.get<ConceptoFactura>(`/conceptos-factura/${id}`);
        return response.data;
    },

    async create(data: CreateConceptoFacturaDto): Promise<ConceptoFactura> {
        const response = await apiClient.post<ConceptoFactura>('/conceptos-factura', data);
        return response.data;
    },

    async update(id: number, data: UpdateConceptoFacturaDto): Promise<ConceptoFactura> {
        const response = await apiClient.patch<ConceptoFactura>(`/conceptos-factura/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/conceptos-factura/${id}`);
    }
};

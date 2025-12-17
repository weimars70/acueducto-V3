import { apiClient } from './client';
import type { ConceptoNomina, CreateConceptoNominaDto, UpdateConceptoNominaDto } from '../../types/concepto-nomina';

interface GetConceptosParams {
  page?: number;
  limit?: number;
  codigo?: string;
  nombre?: string;
  tipo?: string;
  activo?: boolean;
}

interface GetConceptosResponse {
  data: ConceptoNomina[];
  total: number;
  page: number;
  limit: number;
}

class ConceptoNominaService {
  private readonly basePath = '/conceptos-nomina';

  async getConceptos(params?: GetConceptosParams): Promise<GetConceptosResponse> {
    const response = await apiClient.get<GetConceptosResponse>(this.basePath, { params });
    return response.data;
  }

  async getConcepto(id: number): Promise<ConceptoNomina> {
    const response = await apiClient.get<ConceptoNomina>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(concepto: CreateConceptoNominaDto): Promise<ConceptoNomina> {
    const response = await apiClient.post<ConceptoNomina>(this.basePath, concepto);
    return response.data;
  }

  async update(id: number, concepto: UpdateConceptoNominaDto): Promise<ConceptoNomina> {
    const response = await apiClient.put<ConceptoNomina>(`${this.basePath}/${id}`, concepto);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}

export const conceptoNominaService = new ConceptoNominaService();

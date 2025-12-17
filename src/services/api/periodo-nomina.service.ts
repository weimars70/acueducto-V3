import { apiClient } from './client';
import type { PeriodoNomina, CreatePeriodoNominaDto, UpdatePeriodoNominaDto } from '../../types/periodo-nomina';

interface GetPeriodosParams {
  page?: number;
  limit?: number;
  nombre?: string;
  estado?: string;
}

interface GetPeriodosResponse {
  data: PeriodoNomina[];
  total: number;
  page: number;
  limit: number;
}

class PeriodoNominaService {
  private readonly basePath = '/periodos-nomina';

  async getPeriodos(params?: GetPeriodosParams): Promise<GetPeriodosResponse> {
    const response = await apiClient.get<GetPeriodosResponse>(this.basePath, { params });
    return response.data;
  }

  async getPeriodo(id: number): Promise<PeriodoNomina> {
    const response = await apiClient.get<PeriodoNomina>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(periodo: CreatePeriodoNominaDto): Promise<PeriodoNomina> {
    const response = await apiClient.post<PeriodoNomina>(this.basePath, periodo);
    return response.data;
  }

  async update(id: number, periodo: UpdatePeriodoNominaDto): Promise<PeriodoNomina> {
    const response = await apiClient.put<PeriodoNomina>(`${this.basePath}/${id}`, periodo);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async cerrar(id: number): Promise<PeriodoNomina> {
    const response = await apiClient.put<PeriodoNomina>(`${this.basePath}/${id}/cerrar`);
    return response.data;
  }

  async pagar(id: number): Promise<PeriodoNomina> {
    const response = await apiClient.put<PeriodoNomina>(`${this.basePath}/${id}/pagar`);
    return response.data;
  }
}

export const periodoNominaService = new PeriodoNominaService();

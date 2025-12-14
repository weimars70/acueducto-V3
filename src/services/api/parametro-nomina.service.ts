import { apiClient } from './client';
import type { ParametroNomina, CreateParametroNominaDto, UpdateParametroNominaDto, DuplicateYearDto } from '../../types/parametro-nomina';

interface GetParametrosParams {
  page?: number;
  limit?: number;
  anio?: number;
  codigo?: string;
  nombre?: string;
}

interface GetParametrosResponse {
  data: ParametroNomina[];
  total: number;
  page: number;
  limit: number;
}

interface DuplicateYearResponse {
  message: string;
  count: number;
}

class ParametroNominaService {
  private readonly basePath = '/parametros-nomina';

  async getParametros(params?: GetParametrosParams): Promise<GetParametrosResponse> {
    const response = await apiClient.get<GetParametrosResponse>(this.basePath, { params });
    return response.data;
  }

  async getParametro(id: number): Promise<ParametroNomina> {
    const response = await apiClient.get<ParametroNomina>(`${this.basePath}/${id}`);
    return response.data;
  }

  async getYears(): Promise<number[]> {
    const response = await apiClient.get<number[]>(`${this.basePath}/years`);
    return response.data;
  }

  async create(parametro: CreateParametroNominaDto): Promise<ParametroNomina> {
    const response = await apiClient.post<ParametroNomina>(this.basePath, parametro);
    return response.data;
  }

  async update(id: number, parametro: UpdateParametroNominaDto): Promise<ParametroNomina> {
    const response = await apiClient.put<ParametroNomina>(`${this.basePath}/${id}`, parametro);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async duplicateYear(data: DuplicateYearDto): Promise<DuplicateYearResponse> {
    const response = await apiClient.post<DuplicateYearResponse>(`${this.basePath}/duplicate-year`, data);
    return response.data;
  }
}

export const parametroNominaService = new ParametroNominaService();

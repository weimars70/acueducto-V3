import { apiClient } from './client';
import type { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '../../types/empleado';

interface GetEmpleadosParams {
  page?: number;
  limit?: number;
  cedula?: string;
  nombre_completo?: string;
  activo?: boolean;
}

interface GetEmpleadosResponse {
  data: Empleado[];
  total: number;
  page: number;
  limit: number;
}

class EmpleadoService {
  private readonly basePath = '/empleados';

  async getEmpleados(params?: GetEmpleadosParams): Promise<GetEmpleadosResponse> {
    const response = await apiClient.get<GetEmpleadosResponse>(this.basePath, { params });
    return response.data;
  }

  async getEmpleado(id: number): Promise<Empleado> {
    const response = await apiClient.get<Empleado>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(empleado: CreateEmpleadoDto): Promise<Empleado> {
    const response = await apiClient.post<Empleado>(this.basePath, empleado);
    return response.data;
  }

  async update(id: number, empleado: UpdateEmpleadoDto): Promise<Empleado> {
    const response = await apiClient.put<Empleado>(`${this.basePath}/${id}`, empleado);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}

export const empleadoService = new EmpleadoService();

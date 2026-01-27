import { apiClient } from './client';
import type { Nomina, CreateNominaDto, CalcularNominaDto, AprobarNominaDto } from '../../types/nomina';

interface GetNominasParams {
  page?: number;
  limit?: number;
  periodoId?: number;
  estado?: string;
}

interface GetNominasResponse {
  data: Nomina[];
  total: number;
  page: number;
  limit: number;
}

class NominasService {
  private readonly basePath = '/nominas';

  async getNominas(params?: GetNominasParams): Promise<GetNominasResponse> {
    const response = await apiClient.get<GetNominasResponse>(this.basePath, { params });
    return response.data;
  }

  async findOne(id: number): Promise<Nomina> {
    return this.getNomina(id);
  }

  async getNomina(id: number): Promise<Nomina> {
    const response = await apiClient.get<Nomina>(`${this.basePath}/${id}`);
    return response.data;
  }

  async getVouchers(periodoId: number, empresaId: number): Promise<Nomina[]> {
    const response = await apiClient.get<Nomina[]>(`${this.basePath}/vouchers`, {
      params: { periodoId, empresaId }
    });
    return response.data;
  }

  async deleteNomina(id: number): Promise<void> {
    return this.delete(id);
  }

  async create(nomina: CreateNominaDto): Promise<Nomina> {
    const response = await apiClient.post<Nomina>(this.basePath, nomina);
    return response.data;
  }

  async generarNominasParaPeriodo(periodoId: number): Promise<{ message: string; nominas: Nomina[] }> {
    const response = await apiClient.post<{ message: string; nominas: Nomina[] }>(
      `${this.basePath}/generar/${periodoId}`
    );
    return response.data;
  }

  async calcularNomina(nominaId: number): Promise<Nomina> {
    const response = await apiClient.post<Nomina>(`${this.basePath}/calcular`, { nominaId });
    return response.data;
  }

  async aprobarNomina(aprobarDto: AprobarNominaDto): Promise<Nomina> {
    const response = await apiClient.put<Nomina>(`${this.basePath}/${aprobarDto.nominaId}/aprobar`, aprobarDto);
    return response.data;
  }

  async marcarComoPagado(id: number): Promise<Nomina> {
    const response = await apiClient.put<Nomina>(`${this.basePath}/${id}/pagar`);
    return response.data;
  }

  async update(id: number, nomina: Partial<CreateNominaDto>): Promise<Nomina> {
    const response = await apiClient.put<Nomina>(`${this.basePath}/${id}`, nomina);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async crearHoraExtra(dto: {
    empleadoId: number;
    periodoId: number;
    tipo: 'DIURNA' | 'FESTIVA';
    cantidadHoras: number;
    fecha: string;
    aprobado?: boolean;
  }): Promise<any> {
    const response = await apiClient.post<any>(`${this.basePath}/horas-extras`, dto);
    return response.data;
  }

  async crearOtroPago(dto: {
    empleadoId: number;
    periodoId: number;
    concepto: string;
    descripcion?: string;
    valor: number;
    tipo: 'INGRESO' | 'DEDUCCION';
    aprobado?: boolean;
  }): Promise<any> {
    const response = await apiClient.post<any>(`${this.basePath}/otros-pagos`, dto);
    return response.data;
  }

  async getEmpleadosConNominas(periodoId: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`${this.basePath}/periodo/${periodoId}/empleados`);
    return response.data;
  }

  async deleteOtroPago(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/otros-pagos/${id}`);
  }

  async deleteHoraExtra(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/horas-extras/${id}`);
  }
}

export const nominasService = new NominasService();


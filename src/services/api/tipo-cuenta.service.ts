import { apiClient } from './client';

export interface TipoCuenta {
  id: number;
  nombre: string;
  empresa_id?: number;
}

export const tipoCuentaService = {
  /**
   * Obtiene los tipos de cuenta de una empresa específica filtrados en el backend
   */
  async getByEmpresa(empresaId: number): Promise<TipoCuenta[]> {
    const response = await apiClient.get<TipoCuenta[]>(`/users/tipos-cuenta/by-empresa/${empresaId}`);
    return response.data;
  }
};

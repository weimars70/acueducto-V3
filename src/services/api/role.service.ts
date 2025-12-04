import { apiClient } from './client';

export interface Role {
  id: number;
  nombre: string;
  empresa_id?: number;
  descripcion?: string;
  usuario?: string;
}

export const roleService = {
  /**
   * Obtiene los roles de una empresa específica filtrados en el backend
   */
  async getByEmpresa(empresaId: number): Promise<Role[]> {
    const response = await apiClient.get<Role[]>(`/users/roles/by-empresa/${empresaId}`);
    return response.data;
  }
};

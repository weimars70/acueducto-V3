import { apiClient } from './client';
import type { UserEmpresa } from '../../types/empresa';
import type { LoginCredentials, LoginResponse } from '../../types/auth';

export const authService = {
  async getCompaniesByEmail(email: string): Promise<UserEmpresa[]> {
    const response = await apiClient.post<UserEmpresa[]>('/auth/companies', { email });
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
};
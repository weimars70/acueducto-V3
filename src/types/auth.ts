import type { Empresa } from './empresa';

export interface LoginCredentials {
  email: string;
  password: string;
  empresaId: number;
}

export interface User {
  id: number;
  email?: string;
  name?: string;
  username: string;
  empresaId: number;
  role?: string;
  empresa?: Empresa;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
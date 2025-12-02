export interface User {
  user_id: number;
  user_name: string;
  email: string;
  phone?: string;
  active: boolean;
  role_id: number;
  role_nombre?: string;
  role_descripcion?: string;
}

export interface CreateUserDto {
  empresaId: number;
  roleId: number;
  name: string;
  email: string;
  phone?: string;
  password: string;
  active?: boolean;
}

export interface UpdateUserDto {
  empresaId?: number;
  roleId?: number;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  active?: boolean;
}

export interface UserFormData {
  id?: number;
  empresaId: number;
  roleId: number;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  active: boolean;
}

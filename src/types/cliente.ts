export interface Cliente {
  codigo: number;
  identificacion: number;
  nombres: string;
  apellido1: string;
  apellido2?: string;
  direccion?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  activo: boolean;
  empresaId: number;
}

export interface CreateClienteDto {
  identificacion: number;
  nombres: string;
  apellido1: string;
  apellido2?: string;
  direccion?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  activo?: boolean;
  empresa_id: number;
  usuario?: string;
}

export interface UpdateClienteDto extends Partial<CreateClienteDto> {}

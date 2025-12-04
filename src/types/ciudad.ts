export interface Ciudad {
  codigo: string;
  nombre: string;
  empresaId: number;
  usuario?: string;
}

export interface CreateCiudadDto {
  codigo: string;
  nombre: string;
  empresa_id: number;
  usuario?: string;
}

export interface UpdateCiudadDto {
  nombre?: string;
  usuario?: string;
}

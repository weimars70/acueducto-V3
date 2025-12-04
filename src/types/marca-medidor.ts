export interface MarcaMedidor {
  codigo: number;
  nombre: string;
  empresaId: number;
}

export interface CreateMarcaMedidorDto {
  nombre: string;
  empresa_id: number;
  usuario?: string;
}

export interface UpdateMarcaMedidorDto {
  nombre?: string;
  usuario?: string;
}

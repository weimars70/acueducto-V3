export interface Impuesto {
  id: number;
  nombre: string;
  porcentaje?: number;
  empresaId: number;
}

export interface CreateImpuestoDto {
  nombre: string;
  porcentaje?: number;
  empresa_id: number;
  usuario?: string;
}

export interface UpdateImpuestoDto {
  nombre?: string;
  porcentaje?: number;
  usuario?: string;
}

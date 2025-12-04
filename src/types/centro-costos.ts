export interface CentroCostos {
  id: number;
  nombre: string;
  empresaId: number;
  usuario?: string;
}

export interface CreateCentroCostosDto {
  nombre: string;
  empresa_id: number;
  usuario?: string;
}

export interface UpdateCentroCostosDto {
  nombre?: string;
  usuario?: string;
}

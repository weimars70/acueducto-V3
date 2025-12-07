export interface CentroCostos {
  codigo: number;
  nombre: string;
  empresaId: number;
  usuario?: string;
}

export interface CreateCentroCostosDto {
  nombre: string;
}

export interface UpdateCentroCostosDto {
  nombre?: string;
}

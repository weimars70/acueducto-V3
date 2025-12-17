export interface NotaCredito {
  codigo: number;
  instalacionCodigo: number;
  clienteNombre?: string;
  fecha?: string;
  valor?: number;
  disponible?: number;
  concepto?: number;
  observacion?: string;
  empresaId: number;
  usuario?: string;
}

export interface CreateNotaCreditoDto {
  instalacionCodigo: number;
  clienteNombre?: string;
  fecha?: string;
  valor?: number;
  disponible?: number;
  concepto?: number;
  observacion?: string;
  empresaId: number;
  usuario?: string;
}

export interface UpdateNotaCreditoDto extends Partial<CreateNotaCreditoDto> {}

export interface Banco {
  id: number;
  codigo: string;
  nombre: string;
  numero_cuenta: string;
  titular?: string;
  nit_titular?: string;
  entidad_financiera?: string;
  moneda: string;
  centro_costo_id?: number;
  cuenta_contable?: string;
  activa: boolean;
  observaciones?: string;
  fecha_creacion: string;
  creado_por?: string;
  tipo_cuenta: number;
  cuenta?: string; // Campo de la vista
  usuario?: string;
}

export interface CreateBancoDto {
  codigo: string;
  nombre: string;
  numero_cuenta: string;
  titular?: string;
  nit_titular?: string;
  entidad_financiera?: string;
  moneda?: string;
  centro_costo_id?: number;
  cuenta_contable?: string;
  activa?: boolean;
  observaciones?: string;
  creado_por?: string;
  tipo_cuenta: number;
  usuario?: string;
}

export interface UpdateBancoDto extends Partial<CreateBancoDto> {}

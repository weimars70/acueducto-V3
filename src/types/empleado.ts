export interface Empleado {
  id: number;
  cedula: string;
  nombre_completo: string;
  nombre_corto?: string;
  salario_mensual: number;
  auxilio_transporte: boolean;
  activo: boolean;
  fecha_ingreso: string | Date;
  fecha_retiro?: string | Date;
  cargo?: string;
  empresa_id: number;
  fecha_creacion?: string | Date;
  usuario_creacion?: number;
}

export interface CreateEmpleadoDto {
  cedula: string;
  nombre_completo: string;
  nombre_corto?: string;
  salario_mensual: number;
  auxilio_transporte?: boolean;
  activo?: boolean;
  fecha_ingreso: string;
  fecha_retiro?: string;
  cargo?: string;
}

export interface UpdateEmpleadoDto extends Partial<CreateEmpleadoDto> {}

export interface Empleado {
  id: number;
  cedula: string;
  nombre_completo: string;
  primer_nombre?: string;
  otros_nombres?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  salario_mensual: number;
  auxilio_transporte: boolean;
  activo: boolean;
  fecha_ingreso: string | Date;
  fecha_retiro?: string | Date;
  cargo?: string;
  email?: string;
  usuario?: string;
  direccion?: string;
  municipio_id?: string;
  tipo_documento_id?: number;
  tipo_trabajador_id?: number;
  subtipo_trabajador_id?: number;
  tipo_contrato_id?: number;
  metodo_pago_id?: number;
  banco?: number;
  alto_riesgo_pension?: boolean;
  salario_integral?: boolean;
  tipo_cuenta?: number;
  numero_cuenta?: string;
  empresa_id: number;
  fecha_creacion?: string | Date;
  usuario_creacion?: number;
}

export interface CreateEmpleadoDto {
  cedula: string;
  nombre_completo: string;
  primer_nombre?: string;
  otros_nombres?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  salario_mensual: number;
  auxilio_transporte?: boolean;
  activo?: boolean;
  fecha_ingreso: string;
  fecha_retiro?: string;
  cargo?: string;
  email?: string;
  usuario?: string;
  direccion?: string;
  municipio_id?: string;
  tipo_documento_id?: number;
  tipo_trabajador_id?: number;
  subtipo_trabajador_id?: number;
  tipo_contrato_id?: number;
  metodo_pago_id?: number;
  banco?: number;
  alto_riesgo_pension?: boolean;
  salario_integral?: boolean;
  tipo_cuenta?: number;
  numero_cuenta?: string;
}

export interface UpdateEmpleadoDto extends Partial<CreateEmpleadoDto> { }

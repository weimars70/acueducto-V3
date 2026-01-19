import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  cedula: string;

  @IsString()
  nombre_completo: string;

  @IsNumber()
  salario_mensual: number;

  @IsBoolean()
  @IsOptional()
  auxilio_transporte?: boolean;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsDateString()
  fecha_ingreso: string;

  @IsDateString()
  @IsOptional()
  fecha_retiro?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  primer_apellido?: string;

  @IsString()
  @IsOptional()
  segundo_apellido?: string;

  @IsString()
  @IsOptional()
  primer_nombre?: string;

  @IsString()
  @IsOptional()
  otros_nombres?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  usuario?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  municipio_id?: string;

  @IsNumber()
  @IsOptional()
  tipo_documento_id?: number;

  @IsNumber()
  @IsOptional()
  tipo_contrato_id?: number;

  @IsNumber()
  @IsOptional()
  tipo_trabajador_id?: number;

  @IsNumber()
  @IsOptional()
  subtipo_trabajador_id?: number;

  @IsNumber()
  @IsOptional()
  metodo_pago_id?: number;

  @IsNumber()
  @IsOptional()
  banco?: number;

  @IsBoolean()
  @IsOptional()
  alto_riesgo_pension?: boolean;

  @IsBoolean()
  @IsOptional()
  salario_integral?: boolean;

  @IsNumber()
  @IsOptional()
  tipo_cuenta?: number;

  @IsString()
  @IsOptional()
  numero_cuenta?: string;

  @IsNumber()
  empresaId: number;

  @IsNumber()
  @IsOptional()
  usuario_creacion?: number;
}

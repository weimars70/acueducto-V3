import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  cedula: string;

  @IsString()
  nombre_completo: string;

  @IsString()
  @IsOptional()
  nombre_corto?: string;

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

  @IsNumber()
  empresaId: number;

  @IsNumber()
  @IsOptional()
  usuario_creacion?: number;
}

import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateNotasCreditoDto {
  @IsNotEmpty()
  @IsNumber()
  instalacionCodigo: number;

  @IsOptional()
  @IsString()
  clienteNombre?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsNumber()
  valor?: number;

  @IsOptional()
  @IsNumber()
  disponible?: number;

  @IsOptional()
  @IsNumber()
  concepto?: number;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsNotEmpty()
  @IsNumber()
  empresaId: number;

  @IsOptional()
  @IsString()
  usuario?: string;
}

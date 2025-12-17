import { IsNumber, IsString, IsOptional, IsEnum, IsDecimal } from 'class-validator';

export class CreateNominaDto {
  @IsNumber()
  periodoId: number;

  @IsNumber()
  empleadoId: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CalcularNominaDto {
  @IsNumber()
  nominaId: number;
}

export class AprobarNominaDto {
  @IsNumber()
  nominaId: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}


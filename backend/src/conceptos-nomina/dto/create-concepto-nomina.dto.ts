import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateConceptoNominaDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  tipo: string; // DEVENGADO, DEDUCCION

  @IsString()
  @IsOptional()
  subtipo?: string;

  @IsString()
  @IsOptional()
  formula?: string;

  @IsNumber()
  @IsOptional()
  porcentaje?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsNumber()
  empresaId: number;
}

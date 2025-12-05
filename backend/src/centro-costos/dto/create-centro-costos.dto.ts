import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateCentroCostosDto {
  @IsNumber()
  empresaId: number;

  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

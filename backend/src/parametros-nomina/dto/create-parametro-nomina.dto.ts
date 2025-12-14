import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateParametroNominaDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  valor: number;

  @IsNumber()
  anio: number;

  @IsNumber()
  empresaId: number;

  @IsNumber()
  @IsOptional()
  usuarioCreacion?: number;
}

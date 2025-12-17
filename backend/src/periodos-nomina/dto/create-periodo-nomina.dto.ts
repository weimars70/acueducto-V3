import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreatePeriodoNominaDto {
  @IsString()
  nombre: string;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;

  @IsNumber()
  dias_periodo: number;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsNumber()
  empresaId: number;

  @IsNumber()
  @IsOptional()
  usuario_creacion?: number;
}

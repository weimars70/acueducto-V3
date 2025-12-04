import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  tipoident?: number;

  @ApiProperty()
  @IsNumber()
  identificacion: number;

  @ApiProperty()
  @IsString()
  nombres: string;

  @ApiProperty()
  @IsString()
  apellido1: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apellido2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre_comercial?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  fecha_nacimiento?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ciudad_codigo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sector_codigo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  celular?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  redes_sociales?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  dv?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  regimen?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  tipo_persona?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  tipo_impuesto?: number;

  @ApiProperty()
  @IsNumber()
  empresa_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  usuario?: string;
}

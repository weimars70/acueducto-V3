import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateBancoDto {
  @ApiProperty()
  @IsNumber()
  empresaId: number;

  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  numero_cuenta: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  titular?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nit_titular?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entidad_financiera?: string;

  @ApiProperty({ default: 'COP' })
  @IsOptional()
  @IsString()
  moneda?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  centro_costo_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cuenta_contable?: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  creado_por?: string;

  @ApiProperty()
  @IsNumber()
  tipo_cuenta: number;
}

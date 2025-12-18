import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateConsumoDto {
  @ApiProperty()
  @IsNumber()
  instalacion: number;

  @ApiProperty()
  @IsNumber()
  lectura: number;

  @ApiProperty()
  @IsDateString()
  fecha: Date;

  @ApiProperty()
  @IsNumber()
  consumo: number;

  @ApiProperty()
  @IsNumber()
  mes: number;

  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsString()
  medidor: string;

  @ApiProperty()
  @IsNumber()
  otrosCobros: number;

  @ApiProperty()
  @IsNumber()
  reconexion: number;

  @ApiProperty()
  @IsString()
  usuario: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitud?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitud?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imagenBase64?: string;
}

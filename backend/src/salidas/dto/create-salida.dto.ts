import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemSalidaDto {
  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsNumber()
  cantidad: number;

  @ApiProperty()
  @IsNumber()
  psalida: number;

  @ApiProperty()
  @IsNumber()
  por_iva: number;

  @ApiProperty()
  @IsNumber()
  descuento: number;

  @ApiProperty()
  @IsNumber()
  subtotal: number;
}

export class CreateSalidaDto {
  @ApiProperty()
  @IsNumber()
  cliente: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  plazo?: number;

  @ApiProperty()
  @IsString()
  fecha: string;

  @ApiProperty()
  @IsNumber()
  subtotal: number;

  @ApiProperty()
  @IsNumber()
  descuento: number;

  @ApiProperty()
  @IsNumber()
  iva: number;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsString()
  obs: string;

  @ApiProperty({ type: [ItemSalidaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSalidaDto)
  items: ItemSalidaDto[];
}

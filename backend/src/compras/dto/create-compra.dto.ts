import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemCompraDto {
  @ApiProperty()
  @IsNumber()
  codigo: number;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsNumber()
  cantidad: number;

  @ApiProperty()
  @IsNumber()
  pcompra: number;

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

export class CreateCompraDto {
  @ApiProperty()
  @IsNumber()
  proveedor: number;

  @ApiProperty()
  @IsString()
  factura: string;

  @ApiProperty()
  @IsNumber()
  forma_pago: number;

  @ApiProperty()
  @IsNumber()
  plazo: number;

  @ApiProperty()
  @IsDateString()
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

  @ApiProperty({ type: [ItemCompraDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemCompraDto)
  items: ItemCompraDto[];
}

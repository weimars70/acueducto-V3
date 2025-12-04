import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateImpuestoDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  porcentaje?: number;

  @ApiProperty()
  @IsNumber()
  empresa_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  usuario?: string;
}

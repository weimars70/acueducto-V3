import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCentroCostosDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsNumber()
  empresa_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  usuario?: string;
}

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCentroCostosDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  usuario?: string;
}

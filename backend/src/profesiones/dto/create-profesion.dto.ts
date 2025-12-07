import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateProfesionDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsNumber()
    @IsOptional()
    empresa_id?: number;

    @IsString()
    @IsOptional()
    usuario?: string;
}

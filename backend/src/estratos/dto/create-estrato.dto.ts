import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateEstratoDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsNumber()
    empresaId: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

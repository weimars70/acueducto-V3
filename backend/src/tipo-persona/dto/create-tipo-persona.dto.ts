import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTipoPersonaDto {
    @IsNotEmpty()
    @IsNumber()
    codigo: number;

    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsNumber()
    empresa_id: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

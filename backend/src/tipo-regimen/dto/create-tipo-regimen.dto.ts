import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTipoRegimenDto {
    @IsNotEmpty()
    @IsNumber()
    codigo: number;

    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsNumber()
    empresa_id: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

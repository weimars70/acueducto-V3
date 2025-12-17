import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateNotasConceptoDto {
    @IsNotEmpty()
    @IsString()
    descripcion: string;

    @IsOptional()
    @IsString()
    usuario?: string;

    @IsOptional()
    empresaId?: number;
}

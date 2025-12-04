import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateYearsDto {
    @IsNotEmpty()
    @IsNumber()
    year: number;

    @IsNotEmpty()
    @IsNumber()
    empresa_id: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

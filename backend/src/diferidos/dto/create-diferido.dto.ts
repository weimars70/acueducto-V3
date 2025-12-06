import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateDiferidoDto {
    @IsNotEmpty()
    @IsNumber()
    contratoId: number;

    @IsNotEmpty()
    @IsNumber()
    conceptoDiferidoId: number;

    @IsNotEmpty()
    @IsNumber()
    montoOriginal: number;

    @IsNotEmpty()
    @IsNumber()
    numeroCuotas: number;

    @IsNotEmpty()
    @IsDateString()
    fechaInicio: string;

    @IsOptional()
    @IsNumber()
    valorCuota?: number; // Calculated in backend or frontend

    @IsOptional()
    @IsNumber()
    porInteres?: number;

    @IsOptional()
    @IsString()
    observaciones?: string;

    @IsNotEmpty()
    @IsNumber()
    empresaId: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

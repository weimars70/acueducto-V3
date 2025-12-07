import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEstratoTarifaDto {
    @IsNotEmpty()
    @IsNumber()
    codigo: number;

    @IsNotEmpty()
    @IsNumber()
    tipo: number;

    @IsOptional()
    @IsString()
    estrato?: string;

    @IsOptional()
    @IsNumber()
    cargo?: number;

    @IsOptional()
    @IsNumber()
    basico?: number;

    @IsOptional()
    @IsNumber()
    complementario?: number;

    @IsOptional()
    @IsNumber()
    suntuario?: number;

    @IsOptional()
    @IsNumber()
    interes?: number;

    @IsOptional()
    @IsNumber()
    subsidioCargoFijo?: number;

    @IsOptional()
    @IsNumber()
    subsidioConsumo?: number;

    @IsOptional()
    @IsNumber()
    subsidioConsumoComplementario?: number;

    @IsOptional()
    @IsNumber()
    subsidioConsumoSuntuario?: number;

    @IsNotEmpty()
    @IsNumber()
    empresaId: number;

    @IsOptional()
    @IsString()
    usuario?: string;
}

import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMovimientoSaldoAFavorDto {
    @IsNumber()
    @IsNotEmpty()
    instalacion: number;

    @IsString()
    @IsOptional()
    factura?: string;

    @IsNumber()
    @IsOptional()
    credito?: number;

    @IsNumber()
    @IsOptional()
    debito?: number;

    @IsNumber()
    @IsOptional()
    nuevoSaldo?: number;

    @IsString()
    @IsOptional()
    fecha?: string;

    @IsString()
    @IsNotEmpty()
    observacion: string;

    @IsString()
    @IsNotEmpty()
    usuario: string;

    @IsNumber()
    @IsNotEmpty()
    empresaId: number;
}

import { IsString, IsNumber, IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class CreateTerceroDto {
    @IsNumber()
    empresaId: number;

    @IsString()
    ciudadCodigo: string;

    @IsOptional()
    @IsString()
    identificacion?: string;

    @IsOptional()
    @IsNumber()
    dv?: number;

    @IsOptional()
    @IsString()
    nombres?: string;

    @IsOptional()
    @IsString()
    primerApellido?: string;

    @IsOptional()
    @IsString()
    segundoApellido?: string;

    @IsString()
    nombre: string;

    @IsOptional()
    @IsString()
    direccion?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsNumber()
    regimen?: number;

    @IsOptional()
    @IsNumber()
    tipoIdent?: number;

    @IsOptional()
    @IsNumber()
    tipoImpuesto?: number;

    @IsOptional()
    @IsBoolean()
    cliente?: boolean;

    @IsOptional()
    @IsBoolean()
    proveedor?: boolean;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @IsOptional()
    @IsString()
    usuario?: string;
}

export interface Tercero {
    codigo: number;
    empresaId: number;
    ciudadCodigo: string;
    identificacion?: string;
    dv?: number;
    nombres?: string;
    primerApellido?: string;
    segundoApellido?: string;
    nombre: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    regimen?: number;
    tipoIdent?: number;
    tipoImpuesto?: number;
    cliente: boolean;
    proveedor: boolean;
    activo: boolean;
    usuario?: string;
}

export interface CreateTerceroDto {
    empresaId: number;
    ciudadCodigo: string;
    identificacion?: string;
    dv?: number;
    nombres?: string;
    primerApellido?: string;
    segundoApellido?: string;
    nombre: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    regimen?: number;
    tipoIdent?: number;
    tipoImpuesto?: number;
    cliente?: boolean;
    proveedor?: boolean;
    activo?: boolean;
    usuario?: string;
}

export type UpdateTerceroDto = Partial<CreateTerceroDto>;

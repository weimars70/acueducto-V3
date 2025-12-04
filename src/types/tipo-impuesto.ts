export interface TipoImpuesto {
    codigo: number;
    nombre: string;
    code: string;
    empresa_id: number;
    usuario?: string;
}

export interface CreateTipoImpuestoDto {
    codigo: number;
    nombre: string;
    code: string;
    empresa_id: number;
    usuario?: string;
}

export interface UpdateTipoImpuestoDto extends Partial<CreateTipoImpuestoDto> { }

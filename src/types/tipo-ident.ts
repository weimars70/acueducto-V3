export interface TipoIdent {
    codigo: number;
    nombre: string;
    abreviado?: string;
    empresa_id: number;
    usuario?: string;
}

export interface CreateTipoIdentDto {
    codigo: number;
    nombre: string;
    abreviado?: string;
    empresa_id: number;
    usuario?: string;
}

export interface UpdateTipoIdentDto extends Partial<CreateTipoIdentDto> { }

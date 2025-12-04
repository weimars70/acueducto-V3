export interface TipoRegimen {
    codigo: number;
    nombre: string;
    code: string;
    empresa_id: number;
    usuario?: string;
}

export interface CreateTipoRegimenDto {
    codigo: number;
    nombre: string;
    code: string;
    empresa_id: number;
    usuario?: string;
}

export interface UpdateTipoRegimenDto extends Partial<CreateTipoRegimenDto> { }

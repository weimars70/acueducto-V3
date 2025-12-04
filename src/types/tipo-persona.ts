export interface TipoPersona {
    codigo: number;
    nombre: string;
    empresa_id: number;
    usuario?: string;
}

export interface CreateTipoPersonaDto {
    codigo: number;
    nombre: string;
    empresa_id: number;
    usuario?: string;
}

export interface UpdateTipoPersonaDto extends Partial<CreateTipoPersonaDto> { }

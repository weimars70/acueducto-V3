export interface Tarifa {
    id: number;
    basico: number;
    complementario: number;
    desde: string;
    hasta: string;
    empresa_id: number;
    usuario?: string;
}

export interface CreateTarifaDto {
    basico: number;
    complementario: number;
    desde: string;
    hasta: string;
    empresa_id: number;
    usuario?: string;
}

export interface UpdateTarifaDto extends Partial<CreateTarifaDto> { }

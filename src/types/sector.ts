export interface Sector {
    codigo: number;
    nombre: string;
    empresa_id: number;
    usuario?: string;
}

export interface CreateSectorDto {
    nombre: string;
}

export interface UpdateSectorDto {
    nombre: string;
}

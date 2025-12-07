export interface TipoMovimientoItem {
    id: number;
    nombre: string;
    empresaId: number;
}

export interface CreateTipoMovimientoItemDto {
    nombre: string;
    empresa_id: number;
    usuario?: string;
}

export interface UpdateTipoMovimientoItemDto {
    nombre?: string;
    usuario?: string;
}

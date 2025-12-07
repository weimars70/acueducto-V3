export interface ItemGrupo {
    id: number;
    nombre: string;
    empresaId: number;
}

export interface CreateItemGrupoDto {
    nombre: string;
    empresa_id: number;
    usuario?: string;
}

export interface UpdateItemGrupoDto {
    nombre?: string;
    usuario?: string;
}

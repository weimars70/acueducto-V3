export interface NotaConcepto {
    codigo: number;
    empresaId: number;
    descripcion: string;
    usuario?: string;
}

export interface CreateNotaConceptoDto {
    descripcion: string;
}

export interface UpdateNotaConceptoDto {
    descripcion?: string;
}

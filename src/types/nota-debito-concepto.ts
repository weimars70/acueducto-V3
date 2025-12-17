export interface NotaDebitoConcepto {
    codigo: number;
    descripcion: string;
    empresaId: number;
    usuario?: string;
}

export interface CreateNotaDebitoConceptoDto {
    descripcion: string;
    usuario?: string;
    empresaId?: number;
}

export interface UpdateNotaDebitoConceptoDto extends Partial<CreateNotaDebitoConceptoDto> { }

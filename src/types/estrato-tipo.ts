export interface EstratoTipo {
    codigo: number;
    nombre: string;
    empresaId: number;
    usuario?: string;
}

export interface CreateEstratoTipoDto {
    nombre: string;
    empresaId: number;
    usuario?: string;
}

export interface UpdateEstratoTipoDto extends Partial<CreateEstratoTipoDto> { }

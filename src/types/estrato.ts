export interface Estrato {
    codigo: number;
    nombre: string;
    empresaId: number;
    usuario?: string;
}

export interface CreateEstratoDto {
    nombre: string;
    empresaId: number;
    usuario?: string;
}

export interface UpdateEstratoDto extends Partial<CreateEstratoDto> { }

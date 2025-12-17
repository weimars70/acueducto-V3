export interface NotaDebito {
    codigo: number;
    instalacionCodigo: number;
    clienteNombre?: string;
    fecha?: string;
    valor?: number;
    disponible?: number;
    concepto?: number;
    observacion?: string;
    empresaId: number;
    usuario?: string;
}

export interface CreateNotaDebitoDto {
    instalacionCodigo: number;
    clienteNombre?: string;
    fecha?: string;
    valor?: number;
    disponible?: number;
    concepto?: number;
    observacion?: string;
    empresaId: number;
    usuario?: string;
}

export interface UpdateNotaDebitoDto extends Partial<CreateNotaDebitoDto> { }

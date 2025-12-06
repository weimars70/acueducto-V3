export interface ConceptoFactura {
    codigo: number;
    empresaId: number;
    nombre: string;
    activo: boolean;
    usuario?: string;
    usarDiferido: boolean;
}

export interface CreateConceptoFacturaDto {
    empresaId: number;
    nombre: string;
    activo?: boolean;
    usuario?: string;
    usarDiferido?: boolean;
}

export interface UpdateConceptoFacturaDto extends Partial<CreateConceptoFacturaDto> { }

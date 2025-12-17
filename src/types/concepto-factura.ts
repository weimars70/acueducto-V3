export interface ConceptoFactura {
    codigo: number;
    empresaId: number;
    nombre: string;
    activo: boolean;
    usuario?: string;
    usarDiferido: boolean;
}

export interface CreateConceptoFacturaDto {
    nombre: string;
    activo?: boolean;
    usarDiferido?: boolean;
}

export interface UpdateConceptoFacturaDto {
    nombre?: string;
    activo?: boolean;
    usarDiferido?: boolean;
}

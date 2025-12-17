export interface MovimientoSaldoAFavor {
    id: number;
    instalacion: number;
    factura: string;
    credito: number;
    debito: number;
    nuevoSaldo: number;
    fecha: string;
    observacion: string;
    usuario: string;
    empresaId: number;
}

export interface CreateMovimientoSaldoAFavorDto {
    instalacion: number;
    factura?: string;
    credito?: number;
    debito?: number;
    nuevoSaldo?: number;
    fecha?: string;
    observacion: string;
    usuario: string;
    empresaId: number;
}

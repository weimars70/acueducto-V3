export interface Salida {
    codigo: string;
    fechahora: string;
    clienteIdent: string;
    clienteNombre: string;
    formaPago: string;
    plazo: number;
    factura: string;
    fechaFactura: string;
    total: number;
    subtotal: number;
    descuento: number;
    iva: number;
    saldo: number;
    totalUnidades: number;
    anulado: boolean;
    cliente: number;
    empresaId: number;
}

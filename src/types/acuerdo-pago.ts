export interface AcuerdoPago {
    codigo: number;
    instalacion_codigo: number;
    valor: number;
    valor_interes: number;
    abono_deuda: number;
    saldo: number;
    fecha: string;
    cuota: number;
    por_interes: number;
    empresa_id: number;
    usuario: string;
    prefijo: string;
    factura: number;
}

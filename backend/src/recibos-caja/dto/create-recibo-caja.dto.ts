export class CreateReciboCajaDto {
    fecha: string;
    observacion?: string;
    tipo: number;
    instalacion_codigo: number;
    factura: string;
    valor: number;
    documento?: string;
    forma_pago: number;
}

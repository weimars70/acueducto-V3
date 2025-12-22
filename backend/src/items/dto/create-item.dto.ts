export class CreateItemDto {
    codigo?: string;
    nombre: string;
    precio_sin_iva: number;
    por_iva: number;
    precio_total: number;
    grupo: number;
    inventario_actual: number;
    empresa_id: number;
    usuario?: string;
    precio_venta: number;
    inv_valor_compra?: number;
    inv_valor_venta?: number;
}

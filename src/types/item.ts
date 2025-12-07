export interface Item {
    id: number;
    codigo: string;
    nombre: string;
    precioSinIva: number;
    porIva: number;
    precioTotal: number;
    grupo: number;
    inventarioActual: number;
    empresaId: number;
    precioVenta: number;
}

export interface CreateItemDto {
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
}

export interface UpdateItemDto {
    codigo?: string;
    nombre?: string;
    precio_sin_iva?: number;
    por_iva?: number;
    precio_total?: number;
    grupo?: number;
    inventario_actual?: number;
    precio_venta?: number;
    usuario?: string;
}

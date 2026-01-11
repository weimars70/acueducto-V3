export interface Cliente {
    codigo: number;
    identificacion: string;
    nombre: string;
}

export interface ItemSalida {
    id: number;
    codigo: string;
    nombre: string;
    cantidad: number;
    psalida: number;
    por_iva: number;
    descuento: number;
    subtotal: number;
}

export interface ItemCatalogo {
    id: number;
    codigo: string;
    nombre: string;
    precio_sin_iva: number;
    por_iva: number;
    precio_total: number;
    precio_venta: number;
    inventario_actual: number;
}

export interface CreateSalidaDto {
    cliente: number;
    plazo?: number;
    fecha: string;
    subtotal: number;
    descuento: number;
    iva: number;
    total: number;
    obs: string;
    items: ItemSalida[];
}

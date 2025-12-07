export interface ItemCompra {
  codigo: number;
  nombre: string;
  cantidad: number;
  pcompra: number;
  por_iva: number;
  descuento: number;
  subtotal: number;
}

export interface Compra {
  codigo?: number;
  fechahora?: Date | string;
  proveedorIdent?: string;
  proveedorNombre?: string;
  formaPago?: number;
  plazo?: number;
  factura: string;
  fechaFactura?: Date | string;
  total: number;
  subtotal: number;
  descuento: number;
  iva: number;
  saldo?: number;
  totalUnidades?: number;
  anulado?: boolean;
  proveedor: number;
  items?: ItemCompra[];
}

export interface CreateCompraDto {
  proveedor: number;
  factura: string;
  forma_pago: number;
  plazo: number;
  fecha: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  items: ItemCompra[];
}

export interface Proveedor {
  codigo: number;
  identificacion: string;
  nombre: string;
}

export interface Item {
  codigo: number;
  nombre: string;
  precio_sin_iva: number;
  por_iva: number;
  precio_total: number;
  precio_venta: number;
}

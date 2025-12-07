export interface MovimientoInventario {
    id_movimiento: number;
    id_item: number;
    nombre: string;
    tipo_movimiento: string;
    n_tipo_movimiento: string;
    cantidad: number;
    fecha_movimiento: string;
    observaciones: string;
    id_ubicacion_origen: number;
    id_ubicacion_destino: number;
    estado: string;
    fecha_registro: string;
    empresa_id: number;
}

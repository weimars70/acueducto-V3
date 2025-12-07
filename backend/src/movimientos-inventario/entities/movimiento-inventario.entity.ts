import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('view_movimientos_inventario', { synchronize: false })
export class MovimientoInventario {
    @PrimaryColumn()
    id_movimiento: number;

    @Column()
    id_item: number;

    @Column()
    nombre: string;

    @Column()
    tipo_movimiento: string;

    @Column()
    n_tipo_movimiento: string;

    @Column('numeric')
    cantidad: number;

    @Column()
    fecha_movimiento: Date;

    @Column()
    observaciones: string;

    @Column()
    id_ubicacion_origen: number;

    @Column()
    id_ubicacion_destino: number;

    @Column()
    estado: string;

    @Column()
    fecha_registro: Date;

    @Column()
    empresa_id: number;
}

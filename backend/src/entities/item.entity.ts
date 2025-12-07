import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('items')
export class Item {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    codigo: string;

    @Column({ type: 'text' })
    nombre: string;

    @Column({ name: 'precio_sin_iva', type: 'numeric', precision: 12, scale: 2 })
    precioSinIva: number;

    @Column({ name: 'por_iva', type: 'numeric', precision: 12, scale: 2, default: 0 })
    porIva: number;

    @Column({ name: 'precio_total', type: 'numeric', precision: 12, scale: 2 })
    precioTotal: number;

    @Column({ type: 'int4' })
    grupo: number;

    @Column({ name: 'inventario_actual', type: 'numeric', precision: 12, scale: 2, default: 0 })
    inventarioActual: number;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ type: 'text', nullable: true })
    usuario: string;

    @Column({ name: 'precio_venta', type: 'numeric', precision: 12, scale: 2, default: 0 })
    precioVenta: number;
}

import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('salidas')
export class Salida {
    @PrimaryColumn({ type: 'text' })
    codigo: string;

    @Column({ type: 'timestamp', nullable: true })
    fechahora: Date;

    @Column({ name: 'cliente_ident', type: 'text', nullable: true })
    clienteIdent: string;

    @Column({ name: 'cliente_nombre', type: 'text', nullable: true })
    clienteNombre: string;

    @Column({ name: 'forma_pago', type: 'text', nullable: true })
    formaPago: string;

    @Column({ type: 'int4', nullable: true })
    plazo: number;

    @Column({ type: 'text', nullable: true })
    factura: string;

    @Column({ name: 'fecha_factura', type: 'date', nullable: true })
    fechaFactura: Date;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    total: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    subtotal: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    descuento: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    iva: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    saldo: number;

    @Column({ name: 'total_unidades', type: 'numeric', precision: 12, scale: 2, nullable: true })
    totalUnidades: number;

    @Column({ type: 'boolean', default: false })
    anulado: boolean;

    @Column({ type: 'text', nullable: true })
    observacion: string;

    @Column({ type: 'int4', nullable: true })
    cliente: number;

    @Column({ name: 'empresa_id', type: 'int4' })
    empresaId: number;
}

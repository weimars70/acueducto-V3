import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('movimiento_saldos_a_favor')
export class MovimientoSaldoAFavor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    instalacion: number;

    @Column({ default: 'SIN FACTURA' })
    factura: string;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    credito: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    debito: number;

    @Column({ name: 'nuevo_saldo', type: 'numeric', precision: 12, scale: 2, nullable: true })
    nuevoSaldo: number;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    fecha: string;

    @Column()
    observacion: string;

    @Column()
    usuario: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;
}

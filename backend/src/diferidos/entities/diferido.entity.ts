import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Installation } from '../../entities/installation.entity';
import { ConceptoFactura } from '../../entities/concepto-factura.entity';

@Entity('diferido')
export class Diferido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'contrato_id' })
    contratoId: number;

    @Column({ name: 'concepto_diferido_id' })
    conceptoDiferidoId: number;

    @Column({ name: 'monto_original', type: 'numeric', precision: 10, scale: 2 })
    montoOriginal: number;

    @Column({ name: 'numero_cuotas' })
    numeroCuotas: number;

    @Column({ name: 'cuotas_pendientes' })
    cuotasPendientes: number;

    @Column({ name: 'fecha_inicio', type: 'date' })
    fechaInicio: string;

    @Column({ name: 'valor_cuota', type: 'numeric', precision: 12, scale: 2, default: 0 })
    valorCuota: number;

    @Column({ name: 'por_interes', type: 'numeric', precision: 2, scale: 2, default: 0 })
    porInteres: number;

    @Column({ length: 20 })
    estado: string;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column()
    usuario: string;

    @ManyToOne(() => Installation)
    @JoinColumn({ name: 'contrato_id', referencedColumnName: 'codigo' })
    contrato: Installation;

    @ManyToOne(() => ConceptoFactura)
    @JoinColumn({ name: 'concepto_diferido_id', referencedColumnName: 'codigo' })
    concepto: ConceptoFactura;
}

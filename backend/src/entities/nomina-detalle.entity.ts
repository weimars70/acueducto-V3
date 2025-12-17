import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Nomina } from './nomina.entity';
import { ConceptoNomina } from './concepto-nomina.entity';

@Entity('nomina_detalle')
export class NominaDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nomina_id' })
  nominaId: number;

  @Column({ name: 'concepto_id' })
  conceptoId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  cantidad: number;

  @Column({ name: 'valor_unitario', type: 'decimal', precision: 12, scale: 2, nullable: true })
  valorUnitario: number;

  @Column({ name: 'valor_total', type: 'decimal', precision: 12, scale: 2 })
  valorTotal: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ name: 'usuario_creacion', nullable: true })
  usuarioCreacion: number;

  @ManyToOne(() => Nomina, nomina => nomina.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nomina_id' })
  nomina: Nomina;

  @ManyToOne(() => ConceptoNomina)
  @JoinColumn({ name: 'concepto_id' })
  concepto: ConceptoNomina;
}


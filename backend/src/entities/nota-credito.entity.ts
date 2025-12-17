import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('notas_credito')
export class NotaCredito {
  @PrimaryColumn()
  codigo: number;

  @Column({ name: 'instalacion_codigo' })
  instalacionCodigo: number;

  @Column({ name: 'cliente_nombre', nullable: true })
  clienteNombre: string;

  @Column({ type: 'date', nullable: true, default: () => 'CURRENT_DATE' })
  fecha: Date;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  valor: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  disponible: number;

  @Column({ nullable: true })
  concepto: number;

  @Column({ type: 'text', nullable: true })
  observacion: string;

  @PrimaryColumn({ name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'text', nullable: true })
  usuario: string;
}

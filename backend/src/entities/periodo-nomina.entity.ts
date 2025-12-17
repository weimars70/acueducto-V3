import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('periodos_nomina')
export class PeriodoNomina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date' })
  fecha_fin: Date;

  @Column()
  dias_periodo: number;

  @Column({ length: 20, default: 'ABIERTO' })
  estado: string; // ABIERTO, CERRADO, PAGADO

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @Column({ name: 'usuario_creacion', nullable: true })
  usuario_creacion: number;

  @Column({ type: 'timestamp', nullable: true })
  fecha_cierre: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_pago: Date;
}

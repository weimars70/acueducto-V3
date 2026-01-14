import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empleado } from './empleado.entity';
import { PeriodoNomina } from './periodo-nomina.entity';

@Entity('horas_extras')
export class HoraExtra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empleado_id' })
  empleadoId: number;

  @Column({ name: 'periodo_id' })
  periodoId: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ length: 20 })
  tipo: string; // DIURNA, FESTIVA, NOCTURNA

  @Column({ name: 'cantidad_horas', type: 'decimal', precision: 5, scale: 2 })
  cantidadHoras: number;

  @Column({ name: 'valor_hora', type: 'decimal', precision: 12, scale: 2 })
  valorHora: number;

  @Column({ name: 'valor_total', type: 'decimal', precision: 12, scale: 2 })
  valorTotal: number;

  @Column({ default: false })
  aprobado: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ name: 'usuario_creacion', nullable: true })
  usuarioCreacion: number;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @ManyToOne(() => PeriodoNomina)
  @JoinColumn({ name: 'periodo_id' })
  periodo: PeriodoNomina;
}



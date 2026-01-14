import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empleado } from './empleado.entity';
import { PeriodoNomina } from './periodo-nomina.entity';

@Entity('otros_pagos')
export class OtroPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empleado_id' })
  empleadoId: number;

  @Column({ name: 'periodo_id' })
  periodoId: number;

  @Column({ length: 100 })
  concepto: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valor: number;

  @Column({ length: 20, default: 'INGRESO' })
  tipo: string; // INGRESO, DEDUCCION

  @Column({ default: false })
  aprobado: boolean;

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



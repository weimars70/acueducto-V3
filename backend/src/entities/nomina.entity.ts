import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PeriodoNomina } from './periodo-nomina.entity';
import { Empleado } from './empleado.entity';
import { NominaDetalle } from './nomina-detalle.entity';

@Entity('nominas')
export class Nomina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'periodo_id' })
  periodoId: number;

  @Column({ name: 'empleado_id' })
  empleadoId: number;

  @Column({ name: 'salario_mensual', type: 'decimal', precision: 12, scale: 2 })
  salarioMensual: number;

  @Column({ name: 'valor_hora', type: 'decimal', precision: 12, scale: 4 })
  valorHora: number;

  @Column({ name: 'dias_pagados' })
  diasPagados: number;

  @Column({ name: 'total_devengado', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDevengado: number;

  @Column({ name: 'total_deducciones', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeducciones: number;

  @Column({ name: 'neto_pagar', type: 'decimal', precision: 12, scale: 2, default: 0 })
  netoPagar: number;

  @Column({ length: 20, default: 'BORRADOR' })
  estado: string; // BORRADOR, APROBADO, PAGADO

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ name: 'usuario_creacion', nullable: true })
  usuarioCreacion: number;

  @Column({ name: 'fecha_aprobacion', type: 'timestamp', nullable: true })
  fechaAprobacion: Date;

  @Column({ name: 'usuario_aprobacion', nullable: true })
  usuarioAprobacion: number;

  @ManyToOne(() => PeriodoNomina)
  @JoinColumn({ name: 'periodo_id' })
  periodo: PeriodoNomina;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @OneToMany(() => NominaDetalle, detalle => detalle.nomina)
  detalles: NominaDetalle[];
}



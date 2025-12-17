import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  cedula: string;

  @Column({ length: 255 })
  nombre_completo: string;

  @Column({ length: 100, nullable: true })
  nombre_corto: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salario_mensual: number;

  @Column({ default: false })
  auxilio_transporte: boolean;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'date' })
  fecha_ingreso: Date;

  @Column({ type: 'date', nullable: true })
  fecha_retiro: Date;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @Column({ name: 'usuario_creacion', nullable: true })
  usuario_creacion: number;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  cedula: string;

  @Column({ length: 255 })
  nombre_completo: string;

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

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ type: 'text', default: 'weimars70@gmail.com' })
  usuario: string;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ length: 100, nullable: true })
  primer_apellido: string;

  @Column({ length: 100, nullable: true })
  segundo_apellido: string;

  @Column({ length: 100, nullable: true })
  primer_nombre: string;

  @Column({ length: 100, nullable: true })
  otros_nombres: string;

  @Column({ type: 'text', nullable: true })
  municipio_id: string;

  @Column({ nullable: true })
  tipo_documento_id: number;

  @Column({ nullable: true })
  tipo_trabajador_id: number;

  @Column({ nullable: true })
  subtipo_trabajador_id: number;

  @Column({ nullable: true })
  tipo_contrato_id: number;

  @Column({ nullable: true })
  metodo_pago_id: number;

  @Column({ nullable: true })
  banco: number;

  @Column({ default: false })
  alto_riesgo_pension: boolean;

  @Column({ default: false })
  salario_integral: boolean;

  @Column({ nullable: true })
  tipo_cuenta: number;

  @Column({ length: 50, nullable: true })
  numero_cuenta: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @Column({ name: 'usuario_creacion', nullable: true })
  usuario_creacion: number;
}

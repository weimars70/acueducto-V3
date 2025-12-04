import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  codigo: number;

  @Column({ default: 13 })
  tipoident: number;

  @Column()
  identificacion: number;

  @Column({ type: 'text', default: '' })
  nombres: string;

  @Column({ type: 'text', default: '' })
  apellido1: string;

  @Column({ type: 'text', default: '' })
  apellido2: string;

  @Column({ type: 'text', nullable: true })
  nombre_comercial: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ type: 'text', nullable: true })
  ciudad_codigo: string;

  @Column({ nullable: true })
  sector_codigo: number;

  @Column({ type: 'text', default: '' })
  telefono: string;

  @Column({ type: 'text', default: '' })
  celular: string;

  @Column({ type: 'text', default: '' })
  email: string;

  @Column({ type: 'text', default: '' })
  observaciones: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha: Date;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'text', default: '' })
  redes_sociales: string;

  @Column({ nullable: true })
  dv: number;

  @Column({ nullable: true })
  regimen: number;

  @Column({ nullable: true })
  tipo_persona: number;

  @Column({ nullable: true })
  tipo_impuesto: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'text', nullable: true })
  usuario: string;
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('instalaciones')
export class Instalacion {
  @PrimaryGeneratedColumn()
  codigo: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  suscriptor: string;

  @Column({ type: 'int', nullable: true })
  sector: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ident: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  dv: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombres: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  primer_apellido: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  segundo_apellido: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'int', nullable: true })
  regimen: number;

  @Column({ type: 'int', nullable: true })
  tipo_persona: number;

  @Column({ type: 'int', nullable: true })
  tipo_impuesto: number;

  @Column({ type: 'int', nullable: true })
  centro_costos: number;

  @Column({ type: 'boolean', default: false })
  factura_fisica: boolean;

  @Column({ type: 'boolean', default: false })
  enviar_factura_email: boolean;

  @Column({ type: 'boolean', default: false })
  enviar_factura_whatsapp: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion: string;

  @Column({ type: 'int', nullable: true })
  ciudad_codigo: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'int', nullable: true })
  estrato_codigo: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigo_medidor: string;

  @Column({ type: 'int', nullable: true })
  marca_codigo: number;

  @Column({ type: 'int', nullable: true })
  uso_codigo: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  lectura: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  promedio: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  lectura_anterior: number;

  @Column({ type: 'int' })
  empresa_id: number;

  @Column({ type: 'int', nullable: true })
  prefijo: number;

  @Column({ type: 'int', nullable: true })
  orden: number;

  @Column({ type: 'int', nullable: true })
  cliente: number;
}

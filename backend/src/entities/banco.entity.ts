import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bancos')
export class Banco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 30, unique: true })
  numero_cuenta: string;

  @Column({ length: 100, nullable: true })
  titular: string;

  @Column({ length: 20, nullable: true })
  nit_titular: string;

  @Column({ length: 100, nullable: true })
  entidad_financiera: string;

  @Column({ length: 10, default: 'COP' })
  moneda: string;

  @Column({ nullable: true })
  centro_costo_id: number;

  @Column({ length: 20, nullable: true })
  cuenta_contable: string;

  @Column({ default: true })
  activa: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({ length: 50, nullable: true })
  creado_por: string;

  @Column()
  tipo_cuenta: number;
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('instalaciones')
export class Installation {
  @PrimaryGeneratedColumn()
  codigo: number;

  @Column({ name: 'codigo_medidor' })
  codigoMedidor: string;

  @Column()
  nombre: string;

  @Column()
  sector: string;

  @Column()
  direccion: string;

  @Column({ name: 'ciudad_codigo', nullable: true })
  ciudadCodigo: number;

  @Column({ name: 'empresa_id', nullable: true })
  empresaId: number;

  @Column({ nullable: true })
  estado: string;

  @Column({ default: true })
  activo: boolean;
}
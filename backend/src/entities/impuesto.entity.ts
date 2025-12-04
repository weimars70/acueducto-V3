import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('impuestos')
export class Impuesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  nombre: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentaje: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'text', nullable: true })
  usuario: string;
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('centro_costos')
export class CentroCostos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  nombre: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'text', nullable: true })
  usuario: string;
}

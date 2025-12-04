import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tarifas')
export class Tarifa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  basico: number;

  @Column({ type: 'integer' })
  complementario: number;

  @Column({ type: 'date' })
  desde: Date;

  @Column({ type: 'date' })
  hasta: Date;

  @Column({ name: 'empresa_id', type: 'integer' })
  empresaId: number;

  @Column({ type: 'text', nullable: true })
  usuario?: string;
}
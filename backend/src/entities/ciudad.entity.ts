import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ciudades')
export class Ciudad {
  @PrimaryColumn({ type: 'text' })
  codigo: string;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'text', nullable: true })
  usuario: string;
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('centro_costos')
export class CentroCostos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ length: 10, unique: false })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;
}

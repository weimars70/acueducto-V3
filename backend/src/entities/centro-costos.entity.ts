import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('centro_costos')
export class CentroCostos {
  @PrimaryGeneratedColumn({ name: 'codigo' })
  codigo: number;

  @Column({ name: 'nombre' })
  nombre: string;

  @PrimaryColumn({ name: 'empresa_id' })
  empresaId: number;

  @Column({ name: 'usuario', nullable: true })
  usuario: string;
}

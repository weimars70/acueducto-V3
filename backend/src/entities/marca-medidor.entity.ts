import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('marcas_medidor')
export class MarcaMedidor {
  @PrimaryGeneratedColumn()
  codigo: number;

  @Column({ type: 'text', unique: true })
  nombre: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'text', nullable: true })
  usuario: string;
}

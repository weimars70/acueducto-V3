import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_cuenta')
export class TipoCuenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;
}

import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('tipo_impuesto')
export class TipoImpuesto {
  @PrimaryColumn()
  codigo: number;

  @Column({ type: 'text', unique: true })
  nombre: string;

  @Column({ type: 'text' })
  code: string;

  @Column({ name: 'empresa_id', type: 'integer' })
  empresaId: number;

  @Column({ type: 'text', nullable: true })
  usuario?: string;
}

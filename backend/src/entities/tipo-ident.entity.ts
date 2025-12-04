import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('tipo_ident')
export class TipoIdent {
  @PrimaryColumn()
  codigo: number;

  @Column({ type: 'text', unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  abreviado?: string;

  @Column({ name: 'empresa_id', type: 'integer' })
  empresaId: number;

  @Column({ type: 'text', nullable: true })
  usuario?: string;
}

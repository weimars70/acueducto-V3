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

  @Column({ name: 'id_dian', type: 'integer', nullable: true })
  idDian?: number;

  @Column({ type: 'text', nullable: true })
  usuario?: string;
}

import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tipo_regimen')
export class TipoRegimen {
    @PrimaryColumn()
    codigo: number;

    @PrimaryColumn({ name: 'empresa_id' })
    empresaId: number;

    @Column({ type: 'text' })
    nombre: string;

    @Column({ type: 'text' })
    code: string;

    @Column({ type: 'text', nullable: true })
    usuario: string;
}

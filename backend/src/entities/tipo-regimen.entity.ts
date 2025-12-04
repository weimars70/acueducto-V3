import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tipo_regimen')
export class TipoRegimen {
    @PrimaryColumn()
    codigo: number;

    @Column({ unique: true })
    nombre: string;

    @Column()
    code: string;

    @Column({ name: 'empresa_id' })
    empresa_id: number;

    @Column({ nullable: true })
    usuario: string;
}

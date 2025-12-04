import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tipo_persona')
export class TipoPersona {
    @PrimaryColumn()
    codigo: number;

    @Column({ unique: true })
    nombre: string;

    @Column({ name: 'empresa_id' })
    empresa_id: number;

    @Column({ nullable: true })
    usuario: string;
}

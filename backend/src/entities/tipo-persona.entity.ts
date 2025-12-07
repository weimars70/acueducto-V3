import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('tipo_persona')
export class TipoPersona {
    @PrimaryGeneratedColumn()
    codigo: number;

    @PrimaryColumn({ name: 'empresa_id' })
    empresaId: number;

    @Column({ type: 'text' })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    usuario: string;
}

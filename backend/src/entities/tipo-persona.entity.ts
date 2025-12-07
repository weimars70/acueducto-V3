import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_persona')
export class TipoPersona {
    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ default: true })
    activo: boolean;

    @Column({ type: 'text', nullable: true })
    usuario: string;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estratos_tipo')
export class EstratoTipo {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    codigo: number;

    @Column({ unique: true })
    nombre: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ nullable: true })
    usuario: string;
}

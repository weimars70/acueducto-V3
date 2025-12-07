import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estratos')
export class Estrato {
    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ unique: true })
    nombre: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ nullable: true })
    usuario: string;
}

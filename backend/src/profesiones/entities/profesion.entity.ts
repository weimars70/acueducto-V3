import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('profesiones')
export class Profesion {
    @PrimaryGeneratedColumn({ name: 'codigo' })
    codigo: number;

    @Column({ name: 'nombre', unique: false })
    nombre: string;

    @PrimaryColumn({ name: 'empresa_id' })
    empresaId: number;

    @Column({ name: 'usuario', nullable: true })
    usuario: string;
}

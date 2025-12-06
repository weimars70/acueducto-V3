import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tercero } from './tercero.entity';

@Entity('terceros_contactos')
export class TerceroContacto {
    @PrimaryGeneratedColumn({ name: 'id' })
    codigo: number;

    @Column({ name: 'tercero_codigo' })
    terceroCodigo: number;

    @Column({ name: 'tipo_contacto', nullable: true })
    tipoContacto: number;

    @Column({ nullable: true })
    nombre: string;

    @Column({ nullable: true })
    telefono: string;

    @Column({ nullable: true })
    direccion: string;

    @Column({ nullable: true })
    correo: string;

    @ManyToOne(() => Tercero, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tercero_codigo' })
    tercero: Tercero;
}

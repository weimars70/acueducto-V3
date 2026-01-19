import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('subtipo_trabajador')
export class SubtipoTrabajador {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;
}

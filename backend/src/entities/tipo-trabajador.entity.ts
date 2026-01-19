import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_trabajador')
export class TipoTrabajador {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;
}

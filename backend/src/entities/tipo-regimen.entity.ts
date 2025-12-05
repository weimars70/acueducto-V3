import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_regimen')
export class TipoRegimen {
    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ default: true })
    activo: boolean;
}

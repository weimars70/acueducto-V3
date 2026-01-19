import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_contrato')
export class TipoContrato {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;
}

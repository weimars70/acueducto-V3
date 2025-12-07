import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('items_grupos')
export class ItemGrupo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    nombre: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ type: 'text', nullable: true })
    usuario: string;
}

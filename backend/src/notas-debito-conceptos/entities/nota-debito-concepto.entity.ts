import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('notas_debito_conceptos')
@Unique(['descripcion', 'empresaId'])
export class NotaDebitoConcepto {
    @PrimaryGeneratedColumn()
    codigo: number;

    @Column()
    descripcion: string;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ nullable: true })
    usuario: string;
}

import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity('sector')
export class Sector {
    @PrimaryGeneratedColumn({ name: 'codigo' })
    codigo: number;

    @Column({ name: 'nombre', unique: false })
    // Unique constraint is composite (nombre, empresa_id), defined at entity level or just handled by DB. 
    // TypeORM doesn't strictly need Unique decorator if DB has it, but good for sync.
    // Composite unique constraint: @Unique(["nombre", "empresaId"])
    nombre: string;

    @PrimaryColumn({ name: 'empresa_id' })
    empresaId: number;

    @Column({ name: 'usuario', nullable: true })
    usuario: string;
}

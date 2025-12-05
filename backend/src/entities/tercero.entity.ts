import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('terceros')
export class Tercero {
    @PrimaryGeneratedColumn()
    codigo: number;

    @Column({ name: 'empresa_id' })
    empresaId: number;

    @Column({ name: 'ciudad_codigo' })
    ciudadCodigo: string;

    @Column({ nullable: true })
    identificacion: string;

    @Column({ nullable: true })
    dv: number;

    @Column({ nullable: true })
    nombres: string;

    @Column({ name: 'primer_apellido', nullable: true })
    primerApellido: string;

    @Column({ name: 'segundo_apellido', nullable: true })
    segundoApellido: string;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    direccion: string;

    @Column({ nullable: true })
    telefono: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    regimen: number;

    @Column({ name: 'tipo_ident', nullable: true })
    tipoIdent: number;

    @Column({ name: 'tipo_impuesto', nullable: true })
    tipoImpuesto: number;

    @Column({ default: false })
    cliente: boolean;

    @Column({ default: false })
    proveedor: boolean;

    @Column({ default: true })
    activo: boolean;

    @Column({ nullable: true })
    usuario: string;
}

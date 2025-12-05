import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'codigo_alterno', unique: true })
    codigoAlterno: string;

    @Column({ unique: true })
    nombre: string;

    @Column()
    direccion: string;

    @Column()
    ident: string;

    @Column()
    telefono: string;

    @Column({ nullable: true })
    descripcion: string;

    @Column({ name: 'imprime_recibo_caja', nullable: true })
    imprimeReciboCaja: boolean;

    @Column({ nullable: true })
    logo: string;

    @Column({ nullable: true })
    ruta: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    clave: string;

    @Column({ nullable: true })
    usuario: string;
}

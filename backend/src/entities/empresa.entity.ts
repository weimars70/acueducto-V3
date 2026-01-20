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

    @Column({ name: 'whatsapp_api_url', nullable: true })
    whatsappApiUrl: string;

    @Column({ name: 'whatsapp_api', nullable: true })
    whatsappApi: string;

    @Column({ name: 'whatsapp_api_key', nullable: true })
    whatsappApiKey: string;

    @Column({ name: 'host_email', nullable: true })
    hostEmail: string;

    @Column({ name: 'user_email', nullable: true })
    userEmail: string;

    @Column({ name: 'passwd_email', nullable: true })
    passwdEmail: string;

    @Column({ name: 'port_email', nullable: true })
    portEmail: number;

    @Column({ name: 'tipo_documento_id', nullable: true })
    tipoDocumentoId: number;

    @Column({ name: 'municipio_id', nullable: true })
    municipioId: string;

    @Column({ name: 'email_contacto', nullable: true })
    emailContacto: string;
}

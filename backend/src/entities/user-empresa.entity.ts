import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
    name: 'view_usuarios_empresa',
    expression: `SELECT empresa_id, empresa, email FROM view_usuarios_empresa`
})
export class UserEmpresa {
    @ViewColumn({ name: 'empresa_id' })
    empresaId: number;

    @ViewColumn()
    empresa: string;

    @ViewColumn()
    email: string;
}

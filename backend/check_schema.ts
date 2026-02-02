import { Client } from 'pg';

async function checkSchema() {
    const client = new Client({
        host: '2.58.80.90',
        port: 55433,
        user: 'weymars',
        password: '##LosHijos162025?!##',
        database: 'acueducto_emp',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('--- Columns for view_empleados_detallados ---');
        const res1 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'view_empleados_detallados' ORDER BY ordinal_position");
        console.log(res1.rows.map(r => r.column_name).join(', '));

        console.log('\n--- Data for tipo_ident (limit 10) ---');
        const res2 = await client.query("SELECT * FROM tipo_ident LIMIT 10");
        console.table(res2.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkSchema();

import { Client } from 'pg';

async function checkColumns() {
    const client = new Client({
        host: '2.58.80.90',
        port: 55433,
        user: 'weymars',
        password: '##LosHijos162025?!##',
        database: 'acueducto_emp',
    });

    try {
        await client.connect();
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tipo_ident'");
        console.log('All Columns:', res.rows.map(r => r.column_name));
    } catch (err: any) {
        console.error(err.message);
    } finally {
        await client.end();
    }
}

checkColumns();

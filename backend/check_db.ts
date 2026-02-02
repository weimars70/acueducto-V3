import { Client } from 'pg';

async function checkTable() {
    const client = new Client({
        host: '2.58.80.90',
        port: 55433,
        user: 'weymars',
        password: '##LosHijos162025?!##',
        database: 'acueducto_emp',
    });

    try {
        await client.connect();
        const res = await client.query('SELECT * FROM tipo_ident LIMIT 5');
        console.log('Columns:', res.fields.map(f => f.name));
        console.log('Rows:', res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkTable();

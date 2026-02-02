import { Client } from 'pg';

async function checkTable() {
    const client = new Client({
        host: '108.181.193.178',
        port: 5433,
        user: 'weymars',
        password: '##LosHijos162025@@?!##',
        database: 'socorro',
    });

    try {
        await client.connect();
        const res = await client.query('SELECT * FROM tipo_ident LIMIT 5');
        console.log('Columns:', res.fields.map(f => f.name));
        console.log('Rows:', res.rows);
    } catch (err: any) {
        console.error('Error connecting to remote DB:', err.message);
    } finally {
        await client.end();
    }
}

checkTable();

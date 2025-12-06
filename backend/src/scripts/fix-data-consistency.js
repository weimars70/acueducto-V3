
const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Update instalaciones
        const resInst = await client.query(`
            UPDATE instalaciones 
            SET empresa_id = 1 
            WHERE empresa_id IS NULL OR empresa_id = 0;
        `);
        console.log(`Updated ${resInst.rowCount} rows in instalaciones (set empresa_id=1).`);

        // Update conceptos_factura
        const resConc = await client.query(`
            UPDATE conceptos_factura 
            SET empresa_id = 1 
            WHERE empresa_id IS NULL OR empresa_id = 0;
        `);
        console.log(`Updated ${resConc.rowCount} rows in conceptos_factura (set empresa_id=1).`);

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await client.end();
    }
}

run();

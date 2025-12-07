
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

        // Add column if not exists
        try {
            await client.query(`
                ALTER TABLE diferido 
                ADD COLUMN saldo NUMERIC(10,2) DEFAULT 0 NOT NULL;
            `);
            console.log('Added "saldo" column.');
        } catch (e) {
            if (e.code === '42701') {
                console.log('Column "saldo" already exists.');
            } else {
                throw e;
            }
        }

        // Initialize saldo = monto_original for existing records where saldo is 0 or null (though default is 0)
        // Check if we need to update. A smart update:
        const updateRes = await client.query(`
            UPDATE diferido 
            SET saldo = monto_original 
            WHERE saldo = 0 OR saldo IS NULL
        `);

        console.log(`Updated ${updateRes.rowCount} records with initial saldo.`);

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await client.end();
    }
}

run();

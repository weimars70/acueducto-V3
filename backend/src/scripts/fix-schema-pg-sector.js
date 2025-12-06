
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

        console.log('Adding "sector" column to instalaciones...');
        // Using IF NOT EXISTS (Postgres 9.6+) logic if simpler logic fails, but standard ALTER TABLE works well with checking error.
        try {
            await client.query(`
                ALTER TABLE instalaciones 
                ADD COLUMN sector VARCHAR(100);
            `);
            console.log('Added "sector" column to instalaciones.');
        } catch (e) {
            if (e.code === '42701') { // duplicate_column
                console.log('Column "sector" already exists in instalaciones.');
            } else {
                console.error('Error adding column to instalaciones:', e.message);
            }
        }

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await client.end();
    }
}

run();

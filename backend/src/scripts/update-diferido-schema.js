
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

async function addColumnIfNotExists(tableName, columnName, columnType) {
    try {
        await client.query(`
            ALTER TABLE ${tableName} 
            ADD COLUMN ${columnName} ${columnType};
        `);
        console.log(`Added "${columnName}" column to ${tableName}.`);
    } catch (e) {
        if (e.code === '42701') { // duplicate_column
            console.log(`Column "${columnName}" already exists in ${tableName}.`);
        } else {
            console.error(`Error adding "${columnName}" to ${tableName}:`, e.message);
        }
    }
}

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        await addColumnIfNotExists('diferido', 'valor_cuota', 'NUMERIC(12,2) DEFAULT 0 NOT NULL');
        await addColumnIfNotExists('diferido', 'por_interes', 'NUMERIC(2,2) DEFAULT 0 NOT NULL');

        console.log('Finished updating diferido schema.');
    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await client.end();
    }
}

run();

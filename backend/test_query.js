const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'acueducto',
    password: 'admin', // Probando con una contraseña común, ojalá funcione o no la pida
    port: 5432,
});

async function test() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');

        const query = `
        SELECT
          n.id,
          (SELECT SUM(valor_total) FROM public.nomina_detalle nd JOIN public.conceptos_nomina c ON nd.concepto_id = c.id WHERE nd.nomina_id = n.id AND c.subtipo = 'BASICO') as valor_basico
        FROM public.nominas n
        LIMIT 1
    `;

        const res = await client.query(query);
        console.log('Resultado:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

test();

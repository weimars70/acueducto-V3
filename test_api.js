
const axios = require('axios');

async function test() {
    try {
        // Assuming backend is on 3030 based on logs
        const response = await axios.get('http://localhost:3030/salidas/items');
        console.log('Status:', response.status);
        if (response.data && response.data.length > 0) {
            console.log('First item sample:', JSON.stringify(response.data[0], null, 2));
            console.log('Data types:', {
                id: typeof response.data[0].id,
                precio_venta: typeof response.data[0].precio_venta,
                precio_sin_iva: typeof response.data[0].precio_sin_iva,
                inventario_actual: typeof response.data[0].inventario_actual
            });
        } else {
            console.log('No items returned');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();

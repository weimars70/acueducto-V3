import axios from 'axios';
import fs from 'fs';

async function testApi() {
    const url = 'http://2.58.80.90:81/api/ubl2.1/payroll/4213102f-d257-49d6-81d0-1e3a099522ae';
    const token = '830b6616b1b2c93bc67efdc972389c0503e46077fe0751333934fd2acd4afc57';

    try {
        const data = JSON.parse(fs.readFileSync('nomina2.json', 'utf8'));

        // Change percentage to 25.00
        data.accrued.HEDs[0].percentage = "25.00";

        console.log('Testing WITH HEDs and percentage=25.00...');
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

testApi();

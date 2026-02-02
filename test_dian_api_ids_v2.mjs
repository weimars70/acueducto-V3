import axios from 'axios';
import fs from 'fs';

async function testApi() {
    const url = 'http://2.58.80.90:81/api/ubl2.1/payroll/4213102f-d257-49d6-81d0-1e3a099522ae';
    const token = '830b6616b1b2c93bc67efdc972389c0503e46077fe0751333934fd2acd4afc57';

    const baseData = JSON.parse(fs.readFileSync('nomina2.json', 'utf8'));

    for (let i = 1; i <= 2; i++) { // Just test first two
        console.log(`\n--- Testing percentage as ID: ${i} ---`);
        const data = JSON.parse(JSON.stringify(baseData));
        data.accrued.HEDs[0].percentage = i.toString();

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('SUCCESS:', response.status);
            return;
        } catch (error) {
            console.log('Error Status:', error.response?.status);
            console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
        }
    }
}

testApi();

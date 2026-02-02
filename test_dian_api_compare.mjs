import axios from 'axios';
import fs from 'fs';

async function testApi() {
    const url = 'http://2.58.80.90:81/api/ubl2.1/payroll/4213102f-d257-49d6-81d0-1e3a099522ae';
    const token = '830b6616b1b2c93bc67efdc972389c0503e46077fe0751333934fd2acd4afc57';

    const baseData = JSON.parse(fs.readFileSync('nomina2.json', 'utf8'));

    const vals = [1, 99];
    for (const val of vals) {
        console.log(`\n--- Testing percentage: ${val} ---`);
        const data = JSON.parse(JSON.stringify(baseData));
        data.accrued.HEDs[0].percentage = val;

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('SUCCESS:', response.status);
        } catch (error) {
            console.log('FAIL Status:', error.response?.status);
            console.log('FAIL Message:', error.response?.data?.message || error.message);
        }
    }
}

testApi();

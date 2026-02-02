import axios from 'axios';
import fs from 'fs';

async function testApi() {
    const url = 'http://2.58.80.90:81/api/ubl2.1/payroll/4213102f-d257-49d6-81d0-1e3a099522ae';
    const token = '830b6616b1b2c93bc67efdc972389c0503e46077fe0751333934fd2acd4afc57';

    const baseData = JSON.parse(fs.readFileSync('nomina2.json', 'utf8'));

    // Test with type_overtime_surcharge_id
    console.log('\n--- Testing with type_overtime_surcharge_id ---');
    const data = JSON.parse(JSON.stringify(baseData));
    data.accrued.HEDs[0].type_overtime_surcharge_id = 1; // 1 = HED
    // Some APIs use the ID instead of percentage, or both.

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('SUCCESS:', response.status);
    } catch (error) {
        console.log('FAIL:', JSON.stringify(error.response?.data, null, 2));
    }
}

testApi();

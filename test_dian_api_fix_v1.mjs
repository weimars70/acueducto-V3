import axios from 'axios';
import fs from 'fs';

async function testApi() {
    const url = 'http://2.58.80.90:81/api/ubl2.1/payroll/4213102f-d257-49d6-81d0-1e3a099522ae';
    const token = '830b6616b1b2c93bc67efdc972389c0503e46077fe0751333934fd2acd4afc57';

    const data = JSON.parse(fs.readFileSync('nomina2.json', 'utf8'));

    // Fix HEDs according to my findings
    data.accrued.HEDs[0] = {
        "start_time": "2026-01-11T08:00:00",
        "end_time": "2026-01-11T12:00:00",
        "quantity": 4,
        "percentage": 1, // ID for HED
        "payment": "49266.00"
    };

    try {
        console.log('Testing with fixed HED (ID 1 and end_time)...');
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('SUCCESS:', response.status);
        console.log('Result:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('FAIL Status:', error.response?.status);
        console.log('FAIL Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

testApi();

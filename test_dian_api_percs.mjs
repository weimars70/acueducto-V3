import axios from 'axios';
import fs from 'fs';

async function testApi() {
    const url = 'http://2.58.80.90:81/api/ubl2.1/payroll/4213102f-d257-49d6-81d0-1e3a099522ae';
    const token = '830b6616b1b2c93bc67efdc972389c0503e46077fe0751333934fd2acd4afc57';

    const baseData = JSON.parse(fs.readFileSync('nomina2.json', 'utf8'));

    const tests = [
        { name: "percentage=25.00", val: "25.00" },
        { name: "percentage=25", val: "25" },
        { name: "percentage=1.25", val: "1.25" },
        { name: "percentage=125.00", val: "125.00" }
    ];

    for (const test of tests) {
        console.log(`\n--- Testing ${test.name} ---`);
        const data = JSON.parse(JSON.stringify(baseData));
        data.accrued.HEDs[0].percentage = test.val;

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('SUCCESS:', response.status);
            return; // Stop if success
        } catch (error) {
            console.log('FAIL:', error.response?.data?.message || error.message);
        }
    }
}

testApi();

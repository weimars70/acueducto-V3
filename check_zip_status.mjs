import axios from 'axios';

async function checkStatus() {
    const zipKey = '786338c2-8d27-480b-bce9-83c8ae791a56'; // Mentioned by user
    const url = `http://2.58.80.90:81/api/ubl2.1/status/zip/${zipKey}`;
    const token = '830b6616b1b2c93bc67efdc972389c0503e46077fe0751333934fd2acd4afc57';

    console.log(`Checking status for ZipKey: ${zipKey}...`);
    try {
        const response = await axios.post(url, {
            "sendmail": false,
            "sendmailtome": false,
            "is_payroll": true,
            "is_eqdoc": false
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Status Result:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

checkStatus();

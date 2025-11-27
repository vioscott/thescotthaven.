const https = require('https');

const SUPABASE_URL = 'https://rxxzrcuzcxcqdpofldwh.supabase.co';

console.log('Testing connectivity to:', SUPABASE_URL);

const req = https.get(SUPABASE_URL, (res) => {
    console.log('Response status:', res.statusCode);
    console.log('Headers:', res.headers);

    res.on('data', (d) => {
        // just consume data
    });

    res.on('end', () => {
        console.log('Request completed.');
    });
});

req.on('error', (e) => {
    console.error('Connection error:', e);
});

req.setTimeout(10000, () => {
    console.error('Request timed out after 10s');
    req.destroy();
});

console.log('Request sent...');

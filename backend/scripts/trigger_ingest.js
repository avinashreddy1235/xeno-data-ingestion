const axios = require('axios');

const payload = {
    shopUrl: 'xeno-data-store.myshopify.com',
    accessToken: process.env.ACCESS_TOKEN || 'REPLACE_TOKEN',
    name: 'Xeno Real Store'
};

async function trigger() {
    try {
        console.log('🚀 Triggering Ingestion for:', payload.shopUrl);
        const res = await axios.post('http://localhost:4000/api/ingest', payload);
        console.log('✅ Ingestion Successful!');
        console.log('Tenant ID:', res.data.tenantId);
        console.log('Stats:', res.data.stats);
    } catch (error) {
        if (error.response) {
            console.error('❌ Error:', error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

trigger();

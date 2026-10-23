const { Zernio } = require('zernio-sdk');
const zernio = new Zernio({
    apiUrl: process.env.ZERNIO_API_URL || 'https://api.zernio.com',
    apiKey: process.env.ZERNIO_API_KEY || 'your_api_key',
});

module.exports = {
   zernio,
};
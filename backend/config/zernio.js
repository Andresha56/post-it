const { Zernio } = require('@zernio/node');
const zernio = new Zernio({
    apiUrl: process.env.ZERNIO_API_URL || 'https://api.zernio.com',
    apiKey: process.env.ZERNIO_API_KEY || '',
});

module.exports = {
   zernio,
};
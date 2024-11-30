require('dotenv').config({ path: '@env' });

module.exports = {
    chatApiHost: process.env.CHAT_API_HOST,
    internalApiSecret: process.env.INTERNAL_API_JWT_SECRET,
    internalSecret: process.env.INTERNAL_JWT_SECRET,
    host: process.env.HOST
};
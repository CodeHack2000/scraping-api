require('dotenv').config({ path: '@env' });

module.exports = {
    host: process.env.TOR_HOST,
    torInstances: [
        ...Array.from({ length: process.env.TOR_N_INSTANCES }, (_, i) => ({
            
            name: `tor${i + 1}`,
            port: process.env[`TOR_${i + 1}_PORT`],
            controlPort: process.env[`TOR_${i + 1}_CONTROL_PORT`],
            password: process.env[`TOR_${i + 1}_PASSWORD`]
        }))
    ]
};
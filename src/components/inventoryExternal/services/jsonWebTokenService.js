const JWT = require('jsonwebtoken');

const config = require('../config/config');

class JsonWebTokenService {

    constructor(Utils) {

        const { Logger } = Utils;

        this.logger = Logger;
    }
    
    /**
     * Verifies a JSON Web Token for internal API authentication.
     * 
     * @param {string} token - JSON Web Token to verify.
     * @returns {boolean} - True if the token is valid and matches the issuer and audience, false otherwise.
     */
    verifyInternalApiToken(token) {

        this.logger.info('<JsonWebTokenService> - Start Verify Internal Api Token');

        const jwtVerify = JWT.verify(token, config.internalApiSecret);
        const jwtDecoded = JWT.decode(token);

        return jwtVerify 
            && jwtDecoded?.iss === config.chatApiHost
            && jwtDecoded?.aud === config.host;
    }
}

module.exports = JsonWebTokenService;
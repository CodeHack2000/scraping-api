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

    /**
     * Verifies a JSON Web Token for internal use.
     * 
     * @param {string} token - JSON Web Token to verify.
     * @returns {boolean} - True if the token is valid, matches the issuer and audience, and contains a subject (user ID), false otherwise.
     */
    verifyInternalToken(token) {

        this.logger.info('<JsonWebTokenService> - Start Verify Internal Token');

        const jwtVerify = JWT.verify(token, config.internalSecret);
        const jwtDecoded = JWT.decode(token);

        this.logger.info('<JsonWebTokenService> - Internal request for user ' + jwtDecoded?.sub);

        return jwtVerify 
            && jwtDecoded?.iss === config.chatApiHost
            && jwtDecoded?.aud === config.host
            && jwtDecoded?.sub;
    }
}

module.exports = JsonWebTokenService;
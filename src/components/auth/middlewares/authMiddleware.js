const JsonWebTokenService = require('../services/jsonWebTokenService');

class AuthMiddleware {

    constructor(Utils) {

        const { Logger } = Utils;

        this.logger = Logger;
        this.jsonWebTokenService = new JsonWebTokenService(Utils);
    }

    /**
     * Verifies that a request is from an internal API, using the
     * Authorization header's JSON Web Token.
     *
     * @param {Request} req express request
     * @param {Response} res express response
     * @param {NextFunction} next express next function
     * @throws {Error} Unauthorized
     * @returns {Promise<Response>} - Unauthorized response if the token is invalid
     */
    isInternalApiRequest(req, res, next) {

        const token = req?.headers?.['authorization']?.split(' ')[1];

        if (!this.jsonWebTokenService.verifyInternalApiToken(token)) {

            return res.status(401).send('Unauthorized');
        }

        next();
    }

    /**
     * Verifies that a request is from an internal source, using the
     * Authorization header's JSON Web Token.
     *
     * @param {Request} req express request
     * @param {Response} res express response
     * @param {NextFunction} next express next function
     * @throws {Error} Unauthorized
     * @returns {Promise<Response>} - Unauthorized response if the token is invalid
     */
    isInternalRequest(req, res, next) {

        const token = req?.headers?.['authorization']?.split(' ')[1];

        if (!this.jsonWebTokenService.verifyInternalToken(token)) {

            return res.status(401).send('Unauthorized');
        }

        next();
    }
}

module.exports = AuthMiddleware;
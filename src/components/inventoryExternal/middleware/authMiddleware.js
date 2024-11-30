const JsonWebTokenService = require('../services/jsonWebTokenService');

class AuthMiddleware {

    constructor(Utils) {

        this.jsonWebTokenService = new JsonWebTokenService(Utils);
    }

    isInternalRequest(req, res, next) {

        const token = req?.headers?.['authorization']?.split(' ')[1];

        if (!this.jsonWebTokenService.verifyInternalApiToken(token)) {

            return res.status(401).send('Unauthorized');
        }

        next();
    }
}

module.exports = AuthMiddleware;
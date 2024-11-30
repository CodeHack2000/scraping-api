const AuthMiddleware = require('./middlewares/authMiddleware');

class Auth {

    constructor(Utils) {

        this.middlewares = new AuthMiddleware(Utils, {  JsonWebTokenService: this.authJsonWebTokenService });
    }
}

module.exports = Auth;
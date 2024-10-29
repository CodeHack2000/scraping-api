const { SocksProxyAgent } = require('socks-proxy-agent');
const UserAgent = require('user-agents');
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

class AxiosAgentService {

    constructor(host, port) {

        console.log(host, port);

        this.agent = new SocksProxyAgent(`socks://${host}:${port}`);
        this.jar = new CookieJar();
        this.userAgent = new UserAgent();

        this.client = this._getClient();
    }

    /**
     * Returns an Axios client instance configured with a SocksProxyAgent, User-Agent header, and CookieJar.
     */
    _getClient() {

        const client = axios.create({
            httpsAgent: this.agent,
            httpAgent: this.agent,
            headers: {
                'User-Agent': this.userAgent.toString()
            },
            withCredentials: true   // Enable support for cookies
        });

        // Enable cookie jar support
        return wrapper(client, { jar: this.jar });
    }

    generateNewUserAgent() {

        this.userAgent = new UserAgent();
        this.client.defaults.headers['User-Agent'] = this.userAgent.toString();
    }

    async get(url, config = {}) {

        return await this.client.get(url, config);
    }

    async post(url, data = {}, config = {}) {

        return await this.client.post(url, data, config);
    }
}

module.exports = AxiosAgentService;
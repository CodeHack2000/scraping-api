const { SocksProxyAgent } = require('socks-proxy-agent');
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const { HeaderGenerator } = require('header-generator');

class AxiosAgentService {

    constructor(host, port) {

        this.agent = new SocksProxyAgent(`socks://${host}:${port}`);
        this.jar = new CookieJar();

        this.headerGenerator = new HeaderGenerator({
            browsers: ['chrome', 'firefox', 'safari'],
            devices: ['desktop', 'mobile'],
            operatingSystems: ['windows', 'macos', 'linux']
        });

        this.client = this._getClient();
        this.clientManual = this._getClientManual();
    }

    /**
     * Returns an Axios client instance configured with a SocksProxyAgent, User-Agent header, and CookieJar.
     */
    _getClient() {

        const headers = this.headerGenerator.getHeaders();

        headers['accept'] = headers['accept']?.includes('text/html')
            ? `text/html,${headers['accept']}`
            : 'text/html';

        headers['accept-encoding'] = 'gzip, deflate, br';

        const client = axios.create({
            httpsAgent: this.agent,
            httpAgent: this.agent,
            headers,
            withCredentials: true   // Enable support for cookies
        });

        // Enable cookie jar support
        return wrapper(client, { jar: this.jar });
    }

    _getClientManual() {

        const headers = this.headerGenerator.getHeaders();

        headers['accept'] = headers['accept']?.includes('text/html')
            ? `text/html,${headers['accept']}`
            : 'text/html';

        headers['accept-encoding'] = 'gzip, deflate, br';

        return axios.create({
            httpsAgent: this.agent,
            httpAgent: this.agent,
            headers,
            withCredentials: true   // Enable support for cookies
        });
    }

    generateNewHeaders() {
        const newHeaders = this.headerGenerator.getHeaders();

        newHeaders['accept'] = newHeaders['accept']?.includes('text/html')
            ? `${newHeaders['accept']}`
            : `text/html,${newHeaders['accept']}`;

        newHeaders['accept-encoding'] = 'gzip, deflate, br';

        this.client.defaults.headers = newHeaders;
    }

    async get(url, config = {}) {

        return await this.client.get(url, config);
    }

    async getManual(url, config = {}) {

        /*const cookies = await this.jar.getCookieString(url);

        config.headers = { ...config.headers, cookie: cookies };*/

        const response = await this.clientManual.get(url, config);

        const setCookies = response?.headers?.['set-cookie'];
        if (setCookies) {

            await Promise.all(setCookies.map((cookie) => this.jar.setCookie(cookie, url)));
        }

        console.log(this.jar);

        return response;
    }

    async post(url, data = {}, config = {}) {

        return await this.client.post(url, data, config);
    }
}

module.exports = AxiosAgentService;
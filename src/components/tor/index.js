const Zlib = require('zlib');

const torConfig = require('./config/config');
const TorControlService = require('./services/torControlService');
const PuppeteerService = require('./services/puppeteerService');

class Tor {

    constructor(Logger) {

        this.logger = Logger;

        this.torTotalInstances = torConfig.torInstances.length;
        this.torActiveInstances = Array.from({ length: this.torTotalInstances }, () => null);
        this.universalTorInstanceId = this.getNewTorInstance();
    }

    _getTorNumActiveInstances() {

        return this.torActiveInstances.filter((torInstance) => torInstance !== null)?.length;
    }

    _getFirtsAvailableTorInstanceIndex() {

        return this.torActiveInstances.findIndex((torInstance) => torInstance === null);
    }

    _getTorInstance(torIntanceId) {

        let torIntance = null;

        this.logger.info('<Tor> Getting tor instance with ID: ' + torIntanceId);

        try {

            console.log('Total active instances: ' + this.torActiveInstances?.length + ' Requested: ' + torIntanceId);

            if (torIntanceId && this.torActiveInstances?.[torIntanceId - 1]) {

                torIntance = this.torActiveInstances[torIntanceId - 1];
            }
            else {

                this.logger.warn('<Tor> Invalid tor instance ID');
                throw new Error('Invalid tor instance ID');
            }
        }
        catch (error) {

            this.logger.error('<Tor> Error getting tor instance: ' + error.message);
            throw error;
        }

        return torIntance;
    }

    async refreshTorInstance(torIntanceId) {

        let success = true;

        try {

            this.logger.info('<Tor> Refreshing tor instance with ID: ' + torIntanceId);

            const torInstance = this._getTorInstance(torIntanceId);

            // Get a new circuit
            await torInstance.torControl.getNewCircuit();
            
            // Generate a new user agent
            //torInstance.axiosAgent.generateNewHeaders();

            await torInstance.puppeteer.injectNewPage();

            success = true;
        }
        catch (error) {

            this.logger.error('<Tor> Error refreshing tor instance: ' + error.message);
        }

        return success;
    }

    getNewTorInstance() {

        let torIntanceId = null;

        // Only create a new tor instance if there are less than the total number of instances
        if (this._getTorNumActiveInstances() < this.torTotalInstances) {

            const torAvailableIndex = this._getFirtsAvailableTorInstanceIndex();

            // Get the next available tor instance data
            const torInstanceData = torConfig.torInstances[torAvailableIndex];

            const torControl = new TorControlService(this.logger, torConfig.host, torInstanceData);
            //const axiosAgent = new AxiosAgentService(torConfig.host, torInstanceData.port);
            const puppeteer = new PuppeteerService(torConfig.host, torInstanceData.port);

            const torInstance = {
                ...torInstanceData,
                torControl: torControl,
                //axiosAgent: axiosAgent,
                puppeteer: puppeteer
            };

            this.torActiveInstances[torAvailableIndex] = torInstance;
            torIntanceId = torAvailableIndex + 1;
        }

        return torIntanceId;
    }


    delTorInstance(torIntanceId) {

        let success = false;

        try {

            this.logger.info('<Tor> Deleting tor instance with ID: ' + torIntanceId);

            this.torActiveInstances[torIntanceId - 1] = null;

            success = true;
        }
        catch (error) {

            this.logger.error('<Tor> Error deleting tor instance: ' + error.message);
        }

        return success;
    }

    async getPublicIP(torIntanceId) {

        let ip = '';

        try {

            this.logger.info('<Tor> Getting public IP...');

            const torInstance = this._getTorInstance(torIntanceId);

            const { data } = await torInstance.axiosAgent.get('https://api.ipify.org?format=json');

            ip = data?.ip;

            this.logger.debug('<Tor> Public IP: ' + ip);
        }
        catch (error) {

            this.logger.error('<Tor> Error getting public IP: ' + error.message);
        }

        return ip || '';
    }

    async doGetRequest(torIntanceId, url, isFirstRequest = false) {

        const maxRetries = isFirstRequest ? 20 : 5;
        let attempt = 0;
        const response = { success: false, error: '', data: '' };

        while (attempt < maxRetries) {

            try {

                this.logger.debug(`<Tor> Attempt #${attempt + 1} to fetch URL with tor instance ID ${torIntanceId}: ${url}`);

                const torInstance = this._getTorInstance(torIntanceId);

                const { data, status, headers } = await torInstance.axiosAgent.getManual(url);

                const _data = await this.decodeResponse(headers, data);

                if (status === 200 && typeof _data === 'string' && _data.includes('<!doctype html>')) {

                    response.success = true;
                    response.data = _data;

                    this.logger.info(`<Tor> Successfully fetched URL with tor instance ID ${torIntanceId} on attempt #${attempt + 1}`);
                    break; // Exit loop if the response is valid
                }
                else if (typeof _data === 'object') {

                    this.logger.warn(`<Tor> Response does not contain valid HTML on attempt #${attempt + 1}: ` + JSON.stringify(data));
                }
                else {
                    
                    this.logger.warn(`<Tor> Response does not contain valid HTML on attempt #${attempt + 1}`);
                }

            }
            catch (error) {

                this.logger.error(`<Tor> Error fetching URL with tor instance ID ${torIntanceId} on attempt #${attempt + 1}. ${error.message}`);
                response.error = error.message;
            }

            attempt += 1;

            // Wait a small interval before trying again, if necessary
            if (attempt <= maxRetries && response.success === false) {
                
                // Refresh the tor instance
                await new Promise(resolve => setTimeout(resolve, 10000));
                await this.refreshTorInstance(torIntanceId);
            }
        }

        if (!response.success) {
            this.logger.error(`<Tor> Failed to fetch URL with tor instance ID ${torIntanceId} after ${maxRetries} attempts.`);
        }

        return response;
    }

    async doGetRequestBrowser(torIntanceId, url, options = {}) {

        const { isFirstRequest = false, doScrollDown = false } = options;

        const maxRetries = isFirstRequest ? 20 : 5;
        const response = { success: false, error: '', data: '' };
        let attempt = 0;
        let attemptRefreshTorInstance = 3;
        let torInstance = null;

        try {

            torInstance = this._getTorInstance(torIntanceId);

            while (attempt < maxRetries) {

                this.logger.info(`<Tor> Attempt #${attempt + 1} to fetch URL with tor instance ID ${torIntanceId}: ${url}`);

                try {

                    await torInstance.puppeteer.page.goto(url);

                    // TODO: Validar depois este parâmetro para os websites com load dinâmica, pois causa vários erros de timeout
                    //await torInstance.puppeteer.page.waitForNavigation({ waitUntil: 'domcontentloaded' });

                    if (doScrollDown) {

                        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 2000));

                        await this._doScrollDown(torInstance);
                    }

                    const html = await torInstance.puppeteer.page.content();

                    if (html?.includes('</html>')) {

                        response.success = true;
                        response.data = html;

                        this.logger.info(`<Tor> Successfully fetched URL with tor instance ID ${torIntanceId} on attempt #${attempt + 1}`);
                        break; // Exit loop if the response is valid
                    }

                    attempt++;
                    attemptRefreshTorInstance--;

                    // Wait a small interval before trying again, if necessary
                    if (
                        attempt <= maxRetries 
                        && response.success === false
                        && attemptRefreshTorInstance <= 0
                    ) {
                        
                        attemptRefreshTorInstance = 3;

                        // Refresh the tor instance
                        await new Promise(resolve => setTimeout(resolve, 10000));
                        await this.refreshTorInstance(torIntanceId);
                    }
                    else {

                        // Wait 2-7 seconds before trying again
                        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 2000));
                    }
                }
                catch (err) {
    
                    this.logger.error(`<Tor> Error fetching URL with tor instance ID ${torIntanceId} on attempt #${attempt + 1}. ${err.message}`);
                    response.error = err.message;

                    attempt++;
                    attemptRefreshTorInstance--;

                    if (
                        attempt <= maxRetries 
                        && response.success === false
                        && attemptRefreshTorInstance <= 0
                    ) {
                        
                        attemptRefreshTorInstance = 3;

                        // Refresh the tor instance
                        await new Promise(resolve => setTimeout(resolve, 10000));
                        await this.refreshTorInstance(torIntanceId);
                    }
                    else {

                        // Wait 2seconds before trying again
                        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 2000));
                    }

                }
            }
        }
        catch (error) {

            this.logger.error(`<Tor> Error doing loop to fetch URL with tor instance ID ${torIntanceId}. ${error.message}`);
            response.error = error.message;
        }

        if (!response.success) {
            this.logger.error(`<Tor> Failed to fetch URL with tor instance ID ${torIntanceId} after ${maxRetries} attempts.`);
        }

        return response;
    }

    async _doScrollDown(torInstance) {

        let count = 0;
        const scrollPageToBottom = async () => {

            count += 1;
            console.log('Scrolling page ' + count);

            await torInstance.puppeteer.page.evaluate(() => {
                
                // eslint-disable-next-line no-undef
                window.scrollTo(0, document.body.scrollHeight);
            });

            // Wait 2.5s to page fully load
            await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 2000));
        };
        
        // Scrolling in a loop until a certain condition is met
        let previousHeight = 0;
        while (true) {

            await scrollPageToBottom();
            // eslint-disable-next-line no-undef
            const newHeight = await torInstance.puppeteer.page.evaluate(() => document.body.scrollHeight);

            // Breaking the loop if no new content is loaded
            if (newHeight === previousHeight) {

                break;
            }

            previousHeight = newHeight;
        }
    }

    async initPuppeteer(torIntanceId) {
        
        const torInstance = this._getTorInstance(torIntanceId);
        await torInstance.puppeteer.init();
    }

    async closePuppeteer(torIntanceId) {

        const torInstance = this._getTorInstance(torIntanceId);
        await torInstance.puppeteer.closeBrowser();
    }

    async decodeResponse(headers = {}, data = '') {

        const encoding = headers?.['content-encoding'] || '';
        let decodedData;

        try {

            this.logger.info('<Tor> Decoding response with encoding: ' + encoding);

            const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);

            if (encoding === 'gzip') {

                decodedData = Zlib.gunzipSync(bufferData).toString('utf-8');
            }
            else if (encoding === 'deflate') {
    
                decodedData = Zlib.inflateSync(bufferData).toString('utf-8');
            }
            else if (encoding === 'br') {
    
                decodedData = Zlib.brotliDecompressSync(bufferData).toString('utf-8');
            }
            else {
    
                decodedData = bufferData?.toString('utf-8');
            }
        }
        catch (error) {

            this.logger.error('<Tor> Error decoding response: ' + error.message);
        }

        return decodedData;
    }

    async getCookies(torIntanceId, url) {

        try {

            this.logger.info('<Tor> Getting cookies...');

            let tryCount = 0;

            const torInstance = this._getTorInstance(torIntanceId);

            while (tryCount < 3 && !torInstance.axiosAgent.jar.getCookies(url).length) {

                const result = await torInstance.axiosAgent.getManual(url);

                let aux = { ...result };
                delete aux.data;
                console.log(aux);

                tryCount++;

                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        catch(error) {

            this.logger.error('<Tor> Error getting cookies: ' + error.message);
        }
    }

    async hasCookies(torIntanceId, url) {

        let cookies = [];

        try {

            const torInstance = this._getTorInstance(torIntanceId);

            console.log('debug1');
            cookies.push( ...await torInstance.axiosAgent.jar.getCookies(url) );
            console.log(cookies);
            console.log('debug2');
        }
        catch (error) {

            this.logger.error('<Tor> Error getting cookies: ' + error.message);
        }

        return cookies?.length > 0;
    }
}

module.exports = Tor;
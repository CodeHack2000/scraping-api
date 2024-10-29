const torConfig = require('./config/config');
const AxiosAgentService = require('./services/axiosAgentService');
const TorControlService = require('./services/torControlService');

class Tor {

    constructor(Logger) {

        this.logger = Logger;

        this.torTotalInstances = torConfig.torInstances.length;
        this.torActiveInstances = Array.from({ length: this.torTotalInstances }, () => null);
    }

    _getTorNumActiveInstances() {

        return this.torActiveInstances.filter((torInstance) => torInstance !== null).length;
    }

    _getFirtsAvailableTorInstanceIndex() {

        return this.torActiveInstances.findIndex((torInstance) => torInstance === null);
    }

    _getTorInstance(torIntanceId) {

        let torIntance = null;

        this.logger.info('Getting tor instance with ID: ' + torIntanceId);

        try {

            this.logger.debug(this.torActiveInstances);

            if (torIntanceId && this.torActiveInstances?.[torIntanceId - 1]) {

                this.logger.debug(this.torActiveInstances[torIntanceId - 1]);
                torIntance = this.torActiveInstances[torIntanceId - 1];
            }
            else {

                this.logger.warn('Invalid tor instance ID');
                throw new Error('Invalid tor instance ID');
            }
        }
        catch (error) {

            this.logger.error('Error getting tor instance: ' + error.message);
            throw error;
        }

        return torIntance;
    }

    async refreshTorInstance(torIntanceId) {

        let success = true;

        try {

            this.logger.info('Refreshing tor instance with ID: ' + torIntanceId);

            const torInstance = this._getTorInstance(torIntanceId);

            // Get a new circuit
            await torInstance.torControl.getNewCircuit();
            
            // Generate a new user agent
            torInstance.axiosAgent.generateNewUserAgent();

            success = true;
        }
        catch (error) {

            this.logger.error('Error refreshing tor instance: ' + error.message);
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
            const axiosAgent = new AxiosAgentService(torConfig.host, torInstanceData.port);

            const torInstance = {
                ...torInstanceData,
                torControl: torControl,
                axiosAgent: axiosAgent
            };

            this.torActiveInstances[torAvailableIndex] = torInstance;
            torIntanceId = torAvailableIndex + 1;
        }

        return torIntanceId;
    }


    delTorInstance(torIntanceId) {

        let success = false;

        try {

            this.logger.info('Deleting tor instance with ID: ' + torIntanceId);

            this.torActiveInstances[torIntanceId - 1] = null;

            success = true;
        }
        catch (error) {

            this.logger.error('Error deleting tor instance: ' + error.message);
        }

        return success;
    }

    async getPublicIP(torIntanceId) {

        let ip = '';

        try {

            this.logger.info('Getting public IP...');

            const torInstance = this._getTorInstance(torIntanceId);

            console.log(torInstance);

            const { data } = await torInstance.axiosAgent.get('https://api.ipify.org?format=json');

            ip = data?.ip;

            this.logger.debug('Public IP: ' + ip);
        }
        catch (error) {

            this.logger.error('Error getting public IP: ' + error.message);
        }

        return ip || '';
    }

    async doGetRequest(torIntanceId, url) {

        const maxRetries = 5;
        let attempt = 0;
        const response = { success: false, error: '', data: '' };

        while (attempt < maxRetries) {

            try {

                this.logger.debug(`Attempt #${attempt + 1} to fetch URL with tor instance ID ${torIntanceId}: ${url}`);

                const torInstance = this._getTorInstance(torIntanceId);

                const { data, status } = await torInstance.axiosAgent.get(url);

                if (status === 200 && typeof data === 'string' && data.includes('<!doctype html>')) {

                    response.success = true;
                    response.data = data;

                    this.logger.info(`Successfully fetched URL with tor instance ID ${torIntanceId} on attempt #${attempt + 1}`);
                    break; // Exit loop if the response is valid
                }
                else if (typeof data === 'object') {

                    this.logger.warn(`Response does not contain valid HTML on attempt #${attempt + 1}: ` + JSON.stringify(data));
                }
                else {
                    
                    this.logger.warn(`Response does not contain valid HTML on attempt #${attempt + 1}`);
                }

            }
            catch (error) {

                this.logger.error(`Error fetching URL with tor instance ID ${torIntanceId} on attempt #${attempt + 1}. ${error.message}`);
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
            this.logger.error(`Failed to fetch URL with tor instance ID ${torIntanceId} after ${maxRetries} attempts.`);
        }

        return response;
    }
}

module.exports = Tor;
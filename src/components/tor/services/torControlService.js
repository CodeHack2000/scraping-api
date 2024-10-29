const TorControl = require('tor-control');

class TorControlService {

    constructor(Logger, host, torInstanceData) {

        this.logger = Logger;
        this.control = new TorControl({
            password: torInstanceData?.password,
            persistent: true,
            port: torInstanceData?.controlPort,
            host: host
        });
    }

    /**
     * Sends a signal to the Tor process to establish a new circuit. The returned promise
     * resolves with the status of the signal request, or rejects with an error if the
     * request fails.
     * 
     * @returns {Promise<Object>} a promise that resolves with the status of the signal
     * request
     */
    async getNewCircuit() {

        try {

            this.logger.info('Getting new circuit...');

            await this.control.signalNewnym();

            this.logger.info('New circuit obtained successfully!');
        }
        catch (error) {

            this.logger.error(error.message);
            throw error;
        }
    }
}

module.exports = TorControlService;
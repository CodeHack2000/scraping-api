const puppeteer = require('puppeteer');
//const { newInjectedPage } = require('fingerprint-injector');
const { FingerprintGenerator } = require('fingerprint-generator');
const { FingerprintInjector } = require('fingerprint-injector');

class PuppeteerService {

    constructor(host, port) {

        this.proxyUrl = `socks://${host}:${port}`;
        
        this.fingerprintInjector = new FingerprintInjector();
        this.fingerprintGenerator = new FingerprintGenerator({
            devices: ['desktop', 'mobile'],
            operatingSystems: ['windows', 'macos', 'android', 'ios', 'linux'],
            browsers: ['chrome', 'firefox', 'safari', 'edge'],
            locales: ['en-US', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'ja-JP', 'ko-KR', 'pt-BR', 'ru-RU', 'zh-CN', 'zh-TW', 'ar-SA', 'hi-IN', 'id-ID', 'nl-NL', 'pl-PL', 'sv-SE', 'tr-TR', 'uk-UA']
        });

        this.context = null;
        this.browser = null;
        this.page = null;
    }

    async init() {

        const args = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-features=UseOzonePlatform',
            `--proxy-server=${this.proxyUrl}`,
            '--proxy-bypass-list=<-loopback>',
            '--ignoreHTTPSErrors'
        ];

        this.browser = await puppeteer.launch({

            headless: true,
            args,
        });

        this.page = await this.browser.newPage();

        await this.injectNewPage();
    }

    async closeBrowser() {

        await this.browser.close();
    }

    async injectNewPage() {
        
        try {

            const { fingerprint } = this.fingerprintGenerator.getFingerprint();

            await this.fingerprintInjector.attachFingerprintToPuppeteer(this.page, { fingerprint });
        }
        catch(error) {

            console.log(error.message);
        }
    }
}

module.exports = PuppeteerService;
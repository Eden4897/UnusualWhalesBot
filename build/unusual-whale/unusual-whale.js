"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScraper = exports.guildsFile = void 0;
const puppeteer = require("puppeteer");
const config_json_1 = require("../config.json");
const flow_1 = require("./flow");
const file_1 = require("../util/file");
const news_flow_1 = require("./news-flow");
const flow_alert_1 = require("./flow-alert");
const dark_flow_1 = require("./dark-flow");
const otc_trade_1 = require("./otc-trade");
const halt_ipo_1 = require("./halt-ipo");
exports.guildsFile = new file_1.JSONArray('guilds.json');
async function startScraper() {
    const browser = await puppeteer.launch(config_json_1.DEBUG ? {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false,
        defaultViewport: null
    } : {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const loginPage = await login(browser);
    await Promise.all([
        (0, flow_1.watchFlow)(browser),
        (0, news_flow_1.watchNewsFlow)(browser),
        (0, flow_alert_1.watchFlowAlert)(browser),
        (0, dark_flow_1.watchDarkFlow)(browser),
        (0, otc_trade_1.watchOTCTrade)(browser),
        (0, halt_ipo_1.watchHaltIPO)(browser)
    ]);
    loginPage.close();
    console.log('Setup Conpleted');
}
exports.startScraper = startScraper;
async function login(browser) {
    const page = (await browser.pages())[0];
    await page.goto('https://www.unusualwhales.com/login');
    await page.waitForSelector('#router-root > section > div > div > div > div > form > div:nth-child(1) > input');
    await page.type('#router-root > section > div > div > div > div > form > div:nth-child(1) > input', config_json_1.WHALE_USER);
    await page.waitForSelector('#router-root > section > div > div > div > div > form > div.form-group.mb-5 > input');
    await page.type('#router-root > section > div > div > div > div > form > div.form-group.mb-5 > input', config_json_1.WHALE_PWD);
    await page.waitForSelector('#router-root > section > div > div > div > div > div > button > div');
    await page.click('#router-root > section > div > div > div > div > div > button > div');
    await page.waitForNavigation();
    return page;
}
//# sourceMappingURL=unusual-whale.js.map
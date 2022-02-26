"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScraper = exports.pages = exports.guildsFile = void 0;
const puppeteer = require("puppeteer");
const config_json_1 = require("../config.json");
const flow_1 = require("./flow");
const file_1 = require("../util/file");
const news_flow_1 = require("./news-flow");
const flow_alert_1 = require("./flow-alert");
const dark_flow_1 = require("./dark-flow");
const otc_trade_1 = require("./otc-trade");
const halt_ipo_1 = require("./halt-ipo");
exports.guildsFile = new file_1.JSONArray("JSONs/guilds.json");
exports.pages = {
    intradayAnalyst: null,
    hotChainsNTickers: null,
    hotChainsNTickersHidden: null,
    tickersFlow: null,
    sectorFlow: null,
    chainExplorer: null,
    openIntrestExplorer: null,
    optionsDashboard: null,
    optionsDashboardHidden: null,
    optionsCharting: null,
    historicalFlow: null,
};
async function startScraper() {
    const browser = await puppeteer.launch(config_json_1.HEADLESS
        ? {
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }
        : {
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: false,
            defaultViewport: null,
        });
    const loginPage = await login(browser);
    await Promise.all([
        new Promise(async (res) => {
            exports.pages.intradayAnalyst = await browser.newPage();
            await exports.pages.intradayAnalyst.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36");
            await exports.pages.intradayAnalyst.setViewport({ width: 2560, height: 2000 });
            res();
        }),
        new Promise(async (res) => {
            exports.pages.hotChainsNTickers = await browser.newPage();
            await exports.pages.hotChainsNTickers.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36");
            await exports.pages.hotChainsNTickers.setViewport({ width: 2560, height: 4000 });
            await exports.pages.hotChainsNTickers.goto("https://www.unusualwhales.com/flow/hot_chains");
            await new Promise((res) => setTimeout(res, 1000));
            res();
        }),
        new Promise(async (res) => {
            exports.pages.hotChainsNTickersHidden = await browser.newPage();
            await exports.pages.hotChainsNTickersHidden.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36");
            await exports.pages.hotChainsNTickersHidden.setViewport({
                width: 2560,
                height: 4000,
            });
            await exports.pages.hotChainsNTickersHidden.goto("https://www.unusualwhales.com/flow/hot_chains");
            await exports.pages.hotChainsNTickersHidden.waitForSelector(".MuiButton-contained");
            await exports.pages.hotChainsNTickersHidden.click(".MuiButton-contained");
            await new Promise((res) => setTimeout(res, 1000));
            res();
        }),
    ]);
    console.log("Setup Completed");
    await Promise.all([
        (0, flow_1.watchFlow)(browser),
        (0, news_flow_1.watchNewsFlow)(browser),
        (0, flow_alert_1.watchFlowAlert)(browser),
        (0, dark_flow_1.watchDarkFlow)(browser),
        (0, otc_trade_1.watchOTCTrade)(browser),
        (0, halt_ipo_1.watchHaltIPO)(browser),
    ]);
    loginPage.close();
}
exports.startScraper = startScraper;
async function login(browser) {
    const page = (await browser.pages())[0];
    await page.goto("https://www.unusualwhales.com/login");
    await page.waitForSelector("#router-root > section > div > div > div > div > form > div:nth-child(1) > input");
    await page.type("#router-root > section > div > div > div > div > form > div:nth-child(1) > input", config_json_1.WHALE_USER);
    await page.waitForSelector("#router-root > section > div > div > div > div > form > div.form-group.mb-5 > input");
    await page.type("#router-root > section > div > div > div > div > form > div.form-group.mb-5 > input", config_json_1.WHALE_PWD);
    await page.waitForSelector("#router-root > section > div > div > div > div > div > button > div");
    await page.click("#router-root > section > div > div > div > div > div > button > div");
    await page.waitForNavigation();
    await page.waitForSelector('input[name="Dark Mode Switch"]');
    await page.evaluate(() => (document.querySelector('input[name="Dark Mode Switch"]')).click());
    return page;
}
//# sourceMappingURL=unusual-whale.js.map
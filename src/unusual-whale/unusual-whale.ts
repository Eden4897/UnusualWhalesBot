import * as puppeteer from "puppeteer";
import { WHALE_USER, WHALE_PWD, DEBUG } from '../config.json';
import { watchFlow } from "./flow";
import { JSONArray } from "../util/file";
import { watchNewsFlow } from "./news-flow";
import { watchFlowAlert } from "./flow-alert";
import { watchDarkFlow } from "./dark-flow";
import { watchOTCTrade } from "./otc-trade";
import { watchHaltIPO } from "./halt-ipo";

export const guildsFile = new JSONArray<{
    id: string;
    flowChannel: string;
    newsFlowChannel: string;
    darkFlowChannel: string;
    flowAlertChannel: string;
    OTCTradeChannel: string;
    haltIPOChannel: string;
}>('guilds.json');

export async function startScraper(): Promise<void> {
    const browser: puppeteer.Browser = await puppeteer.launch(DEBUG ? {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false,
        defaultViewport: null
    } : {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const loginPage: puppeteer.Page = await login(browser);

    await Promise.all([
        watchFlow(browser),
        watchNewsFlow(browser),
        watchFlowAlert(browser),
        watchDarkFlow(browser),
        watchOTCTrade(browser),
        watchHaltIPO(browser)
    ])

    loginPage.close();

    console.log('Setup Conpleted');
}

async function login(browser: puppeteer.Browser): Promise<puppeteer.Page> {
    const page: puppeteer.Page = (await browser.pages())[0];
    await page.goto('https://www.unusualwhales.com/login');

    await page.waitForSelector('#router-root > section > div > div > div > div > form > div:nth-child(1) > input');
    await page.type('#router-root > section > div > div > div > div > form > div:nth-child(1) > input', WHALE_USER);

    await page.waitForSelector('#router-root > section > div > div > div > div > form > div.form-group.mb-5 > input');
    await page.type('#router-root > section > div > div > div > div > form > div.form-group.mb-5 > input', WHALE_PWD);

    await page.waitForSelector('#router-root > section > div > div > div > div > div > button > div');
    await page.click('#router-root > section > div > div > div > div > div > button > div');
    await page.waitForNavigation();

    return page;
}


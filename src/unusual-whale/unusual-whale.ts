import * as puppeteer from 'puppeteer';
import { WHALE_USER, WHALE_PWD, HEADLESS } from '../config.json';
import { watchFlow } from './flow';
import { JSONArray } from '../util/file';
import { watchNewsFlow } from './news-flow';
import { watchFlowAlert } from './flow-alert';
import { watchDarkFlow } from './dark-flow';
import { watchOTCTrade } from './otc-trade';
import { watchHaltIPO } from './halt-ipo';
export const guildsFile = new JSONArray<GuildsFileType>('JSONs/guilds.json');

export type GuildsFileType = {
	id: string;
	owner?: string;
	enabled: boolean;
	flowChannel?: string;
	newsFlowChannel?: string;
	darkFlowChannel?: string;
	flowAlertChannel?: string;
	OTCTradeChannel?: string;
	haltIPOChannel?: string;
	footer?: string;
	footerIcon?: string;
	helpEmbedDesc?: string;
	helpEmbedTitle?: string;
};

export let pages: {
	intradayAnalyst: puppeteer.Page;
	hotChainsNTickers: puppeteer.Page;
	hotChainsNTickersHidden: puppeteer.Page;
	tickerFlows: puppeteer.Page;
	sectorFlow: puppeteer.Page;
	chainExplorer: puppeteer.Page;
	openIntrestExplorer: puppeteer.Page;
	optionsDashboard: puppeteer.Page;
	optionsDashboardHidden: puppeteer.Page;
	optionsCharting: puppeteer.Page;
	historicalFlow: puppeteer.Page;
} = {
	intradayAnalyst: null,
	hotChainsNTickers: null,
	hotChainsNTickersHidden: null,
	tickerFlows: null,
	sectorFlow: null,
	chainExplorer: null,
	openIntrestExplorer: null,
	optionsDashboard: null,
	optionsDashboardHidden: null,
	optionsCharting: null,
	historicalFlow: null,
};

export async function startScraper(): Promise<puppeteer.Browser> {
	const browser: puppeteer.Browser = await puppeteer.launch(
		HEADLESS
			? {
					args: ['--no-sandbox', '--disable-setuid-sandbox'],
			  }
			: {
					args: ['--no-sandbox', '--disable-setuid-sandbox'],
					headless: false,
					defaultViewport: null,
			  }
	);

	const loginPage: puppeteer.Page = await login(browser);

	await Promise.all([
		watchFlow(browser),
		watchNewsFlow(browser),
		watchFlowAlert(browser),
		watchDarkFlow(browser),
		watchOTCTrade(browser),
		watchHaltIPO(browser),
	]);

	loginPage.close();

	console.log('Setup Completed');
	return browser;
}

async function login(browser: puppeteer.Browser): Promise<puppeteer.Page> {
	const page: puppeteer.Page = (await browser.pages())[0];
	await page.goto('https://www.unusualwhales.com/login');

	await page.waitForSelector(
		'#router-root > div:nth-child(3) > section > div > div > div > div > form > div:nth-child(1) > input'
	);
	await page.type(
		'#router-root > div:nth-child(3) > section > div > div > div > div > form > div:nth-child(1) > input',
		WHALE_USER
	);

	await page.waitForSelector(
		'#router-root > div:nth-child(3) > section > div > div > div > div > form > div.form-group.mb-5 > input'
	);
	await page.type(
		'#router-root > div:nth-child(3) > section > div > div > div > div > form > div.form-group.mb-5 > input',
		WHALE_PWD
	);

	await page.waitForSelector(
		'#router-root > div:nth-child(3) > section > div > div > div > div > div > button > div'
	);
	await page.click(
		'#router-root > div:nth-child(3) > section > div > div > div > div > div > button > div'
	);
	await page.waitForNavigation();

	// await page.waitForSelector('input[name="Dark Mode Switch"]');
	// await page.evaluate(() =>
	//   (<HTMLElement>(
	//     document.querySelector('input[name="Dark Mode Switch"]')
	//   )).click()
	// );

	return page;
}

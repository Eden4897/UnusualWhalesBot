import * as puppeteer from "puppeteer";
import { WHALE_USER, WHALE_PWD, HEADLESS } from "../config.json";
import { watchFlow } from "./flow";
import { JSONArray } from "../util/file";
import { watchNewsFlow } from "./news-flow";
import { watchFlowAlert } from "./flow-alert";
import { watchDarkFlow } from "./dark-flow";
import { watchOTCTrade } from "./otc-trade";
import { watchHaltIPO } from "./halt-ipo";
export const guildsFile = new JSONArray<GuildsFileType>("JSONs/guilds.json");

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

export async function startScraper(): Promise<void> {
  const browser: puppeteer.Browser = await puppeteer.launch(
    HEADLESS
      ? {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }
      : {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          headless: false,
          defaultViewport: null,
        }
  );

  const loginPage: puppeteer.Page = await login(browser);

  await Promise.all([
    //Intraday Analyst
    new Promise<void>(async (res) => {
      pages.intradayAnalyst = await browser.newPage();
      await pages.intradayAnalyst.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.intradayAnalyst.setViewport({ width: 2560, height: 2000 });
      res();
    }),

    //Hot Chains and Tickers
    new Promise<void>(async (res) => {
      pages.hotChainsNTickers = await browser.newPage();
      await pages.hotChainsNTickers.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.hotChainsNTickers.setViewport({ width: 2560, height: 4000 });
      await pages.hotChainsNTickers.goto(
        "https://www.unusualwhales.com/flow/hot_chains"
      );
      await new Promise((res) => setTimeout(res, 1000));
      res();
    }),

    //Hot Chains and Tickers Hidden
    new Promise<void>(async (res) => {
      pages.hotChainsNTickersHidden = await browser.newPage();
      await pages.hotChainsNTickersHidden.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.hotChainsNTickersHidden.setViewport({
        width: 2560,
        height: 4000,
      });
      await pages.hotChainsNTickersHidden.goto(
        "https://www.unusualwhales.com/flow/hot_chains"
      );
      await pages.hotChainsNTickersHidden.waitForSelector(
        ".MuiButton-contained"
      );
      await pages.hotChainsNTickersHidden.click(".MuiButton-contained");
      await new Promise((res) => setTimeout(res, 1000));
      res();
    }),

    //Ticker Flows
    new Promise<void>(async (res) => {
      pages.tickerFlows = await browser.newPage();
      await pages.tickerFlows.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.tickerFlows.setViewport({ width: 2560, height: 3000 });
      await pages.tickerFlows.goto(
        "https://www.unusualwhales.com/flow/ticker_flows"
      );
      res();
    }),

    //Chain Explorer
    new Promise<void>(async (res) => {
      pages.chainExplorer = await browser.newPage();
      await pages.chainExplorer.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.chainExplorer.setViewport({ width: 2560, height: 1440 });
      await pages.chainExplorer.goto(
        "https://www.unusualwhales.com/flow/option_chains"
      );
      res();
    }),

    //Sector Flow
    new Promise<void>(async (res) => {
      pages.sectorFlow = await browser.newPage();
      await pages.sectorFlow.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.sectorFlow.setViewport({ width: 2560, height: 1500 });
      await pages.sectorFlow.goto("https://www.unusualwhales.com/flow/sectors");
      res();
    }),

    //Open Intrest Explorer
    new Promise<void>(async (res) => {
      pages.openIntrestExplorer = await browser.newPage();
      await pages.openIntrestExplorer.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.openIntrestExplorer.setViewport({
        width: 2560,
        height: 2000,
      });
      await pages.openIntrestExplorer.goto(
        "https://www.unusualwhales.com/flow/oi_changes"
      );
      res();
    }),

    //Options Dashboard
    new Promise<void>(async (res) => {
      pages.optionsDashboard = await browser.newPage();
      await pages.optionsDashboard.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.optionsDashboard.setViewport({
        width: 2560,
        height: 4500,
      });
      await pages.optionsDashboard.goto(
        "https://www.unusualwhales.com/flow/dashboard"
      );
      res();
    }),

    //Options Dashboard Hidden
    new Promise<void>(async (res) => {
      pages.optionsDashboardHidden = await browser.newPage();
      await pages.optionsDashboardHidden.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.optionsDashboardHidden.setViewport({
        width: 2560,
        height: 4500,
      });
      await pages.optionsDashboardHidden.goto(
        "https://www.unusualwhales.com/flow/dashboard"
      );
      await new Promise((res) => setTimeout(res, 1000));
      await pages.optionsDashboardHidden.evaluate(() => {
        Array(
          ...document.querySelectorAll(".MuiButton-containedPrimary")
        ).forEach((button) => {
          (<HTMLElement>button).click();
        });
      });
      res();
    }),

    //Options Charting
    new Promise<void>(async (res) => {
      pages.optionsCharting = await browser.newPage();
      await pages.optionsCharting.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.optionsCharting.setViewport({
        width: 2560,
        height: 2500,
      });
      await pages.optionsCharting.goto(
        "https://www.unusualwhales.com/flow/charting"
      );
      res();
    }),

    //Historical Flow
    new Promise<void>(async (res) => {
      pages.historicalFlow = await browser.newPage();
      await pages.historicalFlow.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
      );
      await pages.historicalFlow.setViewport({
        width: 2560,
        height: 2500,
      });
      await pages.historicalFlow.goto("https://www.unusualwhales.com/flow/");
      res();
    }),
    watchFlow(browser),
    watchNewsFlow(browser),
    watchFlowAlert(browser),
    watchDarkFlow(browser),
    watchOTCTrade(browser),
    watchHaltIPO(browser),
  ]);

  loginPage.close();

  console.log("Setup Completed");
}

async function login(browser: puppeteer.Browser): Promise<puppeteer.Page> {
  const page: puppeteer.Page = (await browser.pages())[0];
  await page.goto("https://www.unusualwhales.com/login");

  await page.waitForSelector(
    "#router-root > div:nth-child(3) > section > div > div > div > div > form > div:nth-child(1) > input"
  );
  await page.type(
    "#router-root > div:nth-child(3) > section > div > div > div > div > form > div:nth-child(1) > input",
    WHALE_USER
  );

  await page.waitForSelector(
    "#router-root > div:nth-child(3) > section > div > div > div > div > form > div.form-group.mb-5 > input"
  );
  await page.type(
    "#router-root > div:nth-child(3) > section > div > div > div > div > form > div.form-group.mb-5 > input",
    WHALE_PWD
  );

  await page.waitForSelector(
    "#router-root > div:nth-child(3) > section > div > div > div > div > div > button > div"
  );
  await page.click(
    "#router-root > div:nth-child(3) > section > div > div > div > div > div > button > div"
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

import { MessageEmbed, TextChannel } from "discord.js";
import * as puppeteer from "puppeteer";
import { bot } from "..";
import { guildsFile } from "./unusual-whale";
import { DEBUG } from "../config.json";

interface NewsFlowInfo {
  Date: string;
  Headline: string;
}

export async function watchNewsFlow(
  browser: puppeteer.Browser
): Promise<puppeteer.Page> {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
  );
  await page.setViewport({ width: 2560, height: 1440 });
  await page.goto("https://www.unusualwhales.com/flow/news_flow");

  setImmediate(() => observeNewNewsFlow(page));
  return page;
}

async function observeNewNewsFlow(page: puppeteer.Page) {
  let previous = null;
  while (1) {
    await new Promise((res) => setTimeout(res, 10000));
    await page.reload();
    await page.waitForSelector("#flow-trades > table > tbody");
    const newData: NewsFlowInfo = await page.evaluate(async () => {
      const topItem = document.querySelector(
        "#flow-trades > table > tbody > tr:nth-child(1)"
      );
      return {
        Date: topItem.querySelector("td:nth-child(1)").textContent,
        Headline: topItem.querySelector("td:nth-child(2)").textContent,
      };
    });
    if (previous == null) {
      if (DEBUG) newNewsFlowResponse(newData);
      previous = JSON.stringify(newData);
      continue;
    } else if (previous != JSON.stringify(newData)) {
      newNewsFlowResponse(newData);
      previous = JSON.stringify(newData);
    }
  }
}

async function newNewsFlowResponse(info: NewsFlowInfo) {
  const guilds = guildsFile.read();
  guilds.forEach(async (guildInfo) => {
    if (!guildInfo.newsFlowChannel || !guildInfo.enabled) return;

    const embed = new MessageEmbed()
      .setColor("#0390fc")
      .addFields(
        Object.entries(info).map((entry) => {
          return { name: entry[0], value: entry[1] ? entry[1] : "n/a" };
        })
      )
      .setFooter({
        iconURL: guildsFile.find((g) => g.id == guildInfo.id)?.footerIcon,
        text: guildInfo.footer ?? "",
      });

    const guild = await bot.guilds.fetch(guildInfo.id);
    const channel: TextChannel = (await guild.channels.fetch(
      guildInfo.newsFlowChannel
    )) as TextChannel;
    channel.send({ embeds: [embed] });
  });
}

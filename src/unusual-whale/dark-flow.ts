import { MessageEmbed, TextChannel } from "discord.js";
import * as puppeteer from "puppeteer";
import { bot } from "..";
import { guildsFile } from "./unusual-whale";
import { DEBUG } from "../config.json";

interface DarkFlowInfo {
  Date: string;
  "Issue Type": string;
  Ticker: string;
  Premium: string;
  Price: string;
  Size: string;
  Volume: string;
}

export async function watchDarkFlow(
  browser: puppeteer.Browser
): Promise<puppeteer.Page> {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
  );
  await page.setViewport({ width: 2560, height: 1440 });
  await page.goto("https://www.unusualwhales.com/flow/dark");
  await page.waitForSelector("#flow-trades > table > tbody");
  page.exposeFunction("newDarkFlowResponse", newDarkFlowResponse);

  await observeNewDarkFlow(page);
  return page;
}

async function observeNewDarkFlow(page: puppeteer.Page) {
  await page.evaluate(async () => {
    const mutationObserver = new MutationObserver(() => {
      const topItem = document.querySelector(
        "#flow-trades > table > tbody > tr:nth-child(1)"
      );
      const info: DarkFlowInfo = {
        Date: topItem.querySelector("td:nth-child(1)").textContent,
        "Issue Type": topItem.querySelector("td:nth-child(2)").textContent,
        Ticker: topItem.querySelector("td:nth-child(3)").textContent,
        Premium: topItem.querySelector("td:nth-child(4)").textContent,
        Price: topItem.querySelector("td:nth-child(5)").textContent,
        Size: topItem.querySelector("td:nth-child(6)").textContent,
        Volume: topItem.querySelector("td:nth-child(7)").textContent,
      };
      newDarkFlowResponse(info);
    });

    mutationObserver.observe(
      document.querySelector("#flow-trades > table > tbody"),
      { childList: true }
    );
  });
  await new Promise((res) => setTimeout(res, 10000));
  if (DEBUG)
    await page.evaluate(() =>
      document
        .querySelector("#flow-trades > table > tbody > tr:nth-child(1)")
        .remove()
    );
}

async function newDarkFlowResponse(info: DarkFlowInfo) {
  const guilds = guildsFile.read();
  guilds.forEach(async (guildInfo) => {
    if (!guildInfo.darkFlowChannel || !guildInfo.enabled) return;

    const embed = new MessageEmbed()
      .addFields(
        Object.entries(info).map((entry) => {
          return {
            name: entry[0],
            value: entry[1] ? entry[1] : "n/a",
            inline: true,
          };
        })
      )
      .setFooter({ text: guildInfo.footer });

    const guild = await bot.guilds.fetch(guildInfo.id);
    const channel: TextChannel = (await guild.channels.fetch(
      guildInfo.darkFlowChannel
    )) as TextChannel;
    channel.send({ embeds: [embed] });
  });
}

import { MessageEmbed, TextChannel } from "discord.js";
import * as puppeteer from "puppeteer";
import { bot } from "..";
import { guildsFile } from "./unusual-whale";
import { DEBUG } from "../config.json";

interface FlowAlertInfo {
  Date: string;
  Ticker: string;
  "\u200b": string;
  Desc: string;
  Timespan: string;
  Size: string;
  "Amount Of Trades": string;
  "Bid Premium": string;
  "Ask Premium": string;
}

export async function watchFlowAlert(
  browser: puppeteer.Browser
): Promise<puppeteer.Page> {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
  );
  await page.setViewport({ width: 2560, height: 1440 });
  await page.goto("https://www.unusualwhales.com/flow/alerts");
  await page.waitForSelector("#flow-trades > table > tbody");
  page.exposeFunction("newFlowAlertResponse", newFlowAlertResponse);

  await observeNewFlowAlert(page);
  return page;
}

async function observeNewFlowAlert(page: puppeteer.Page) {
  await page.evaluate(async () => {
    const mutationObserver = new MutationObserver(() => {
      const topItem = document.querySelector(
        "#flow-trades > table > tbody > tr:nth-child(1)"
      );
      const info: FlowAlertInfo = {
        Date: topItem.querySelector("td:nth-child(1)").textContent,
        Ticker: topItem.querySelector("td:nth-child(2)").textContent,
        "\u200b": "\u200b",
        Desc: topItem
          .querySelector("td:nth-child(4)")
          .textContent.replace(/[^A-Za-z0-9/$. ]/g, ""),
        Timespan: topItem.querySelector("td:nth-child(5)").textContent,
        Size: topItem.querySelector("td:nth-child(6)").textContent,
        "Amount Of Trades":
          topItem.querySelector("td:nth-child(7)").textContent,
        "Bid Premium": topItem.querySelector("td:nth-child(8)").textContent,
        "Ask Premium": topItem.querySelector("td:nth-child(9)").textContent,
      };
      newFlowAlertResponse(info);
    });

    mutationObserver.observe(
      document.querySelector("#flow-trades > table > tbody"),
      { childList: true, subtree: true }
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

async function newFlowAlertResponse(info: FlowAlertInfo) {
  const guilds = guildsFile.read();
  guilds.forEach(async (guildInfo) => {
    if (!guildInfo.flowAlertChannel || !guildInfo.enabled) return;

    const embed = new MessageEmbed()
      .setColor("#ffffff")
      .addFields(
        Object.entries(info).map((entry) => {
          return {
            name: entry[0],
            value: entry[1] ? entry[1] : "n/a",
            inline: true,
          };
        })
      )
      .setFooter({ text: guildInfo.footer ?? "" });

    const guild = await bot.guilds.fetch(guildInfo.id);
    const channel: TextChannel = (await guild.channels.fetch(
      guildInfo.flowAlertChannel
    )) as TextChannel;
    channel.send({ embeds: [embed] });
  });
}

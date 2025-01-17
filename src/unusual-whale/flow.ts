import { MessageEmbed, TextChannel } from "discord.js";
import * as puppeteer from "puppeteer";
import { bot } from "..";
import { guildsFile } from "./unusual-whale";
import { DEBUG } from "../config.json";

interface FlowInfo {
  Date: string;
  Ticker: string;
  Side: string;
  Strike: string;
  Contract: string;
  "Contract Date": string;
  DTE: string;
  Underlying: string;
  "Bid-Ask": string;
  Spot: string;
  Size: string;
  Premium: string;
  OI: string;
  Volume: string;
  "\u200b": string;
}

export async function watchFlow(
  browser: puppeteer.Browser
): Promise<puppeteer.Page> {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
  );
  await page.setViewport({ width: 2560, height: 1440 });
  await page.goto("https://www.unusualwhales.com/flow");
  await page.waitForSelector("#flow-trades > table > tbody");
  page.exposeFunction("newFlowResponse", newFlowResponse);

  await observeNewFlow(page);
  return page;
}

async function observeNewFlow(page: puppeteer.Page) {
  await page.evaluate(async () => {
    const mutationObserver = new MutationObserver(() => {
      const topItem = document.querySelector(
        "#flow-trades > table > tbody > tr:nth-child(1)"
      );
      const info: FlowInfo = {
        Date: topItem.querySelector("td:nth-child(1)").textContent,
        Ticker: topItem.querySelector("td:nth-child(3)").textContent,
        Side: topItem.querySelector("td:nth-child(4)").textContent,
        Strike: topItem.querySelector("td:nth-child(5)").textContent,
        Contract: topItem
          .querySelector("td:nth-child(6)")
          .textContent.toUpperCase(),
        "Contract Date": topItem.querySelector("td:nth-child(7)").textContent,
        DTE: topItem.querySelector("td:nth-child(8)").textContent,
        Underlying: topItem.querySelector("td:nth-child(9)").textContent,
        "Bid-Ask": topItem.querySelector("td:nth-child(10)").textContent,
        Spot: topItem.querySelector("td:nth-child(11)").textContent,
        Size: topItem.querySelector("td:nth-child(12)").textContent,
        Premium: topItem.querySelector("td:nth-child(13)").textContent,
        OI: topItem.querySelector("td:nth-child(15)").textContent,
        Volume: topItem.querySelector("td:nth-child(14)").textContent,
        "\u200b": "\u200b",
      };
      newFlowResponse(info);
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

async function newFlowResponse(info: FlowInfo) {
  const guilds = guildsFile.read();
  guilds.forEach(async (guildInfo) => {
    if (!guildInfo.flowChannel || !guildInfo.enabled) return;

    const embed = new MessageEmbed()
      .setTitle(`${info.Ticker} ${info.Contract}`)
      .setColor(info.Side === "BUY" ? "#39fc03" : "#fc0303")
      .addFields(
        Object.entries(info).map((entry) => {
          return {
            name: entry[0],
            value: entry[1] ? entry[1] : "n/a",
            inline: true,
          };
        })
      )
      .setFooter({
        iconURL: guildsFile.find((g) => g.id == guildInfo.id)?.footerIcon,
        text: guildInfo.footer ?? "",
      });

    const guild = await bot.guilds.fetch(guildInfo.id);
    const channel: TextChannel = (await guild.channels.fetch(
      guildInfo.flowChannel
    )) as TextChannel;
    channel.send({ embeds: [embed] });
  });
}

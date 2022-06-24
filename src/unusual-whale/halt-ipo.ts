import { MessageEmbed, TextChannel } from "discord.js";
import * as puppeteer from "puppeteer";
import { bot } from "..";
import { guildsFile } from "./unusual-whale";
import { DEBUG } from "../config.json";

interface HaltIPOInfo {
  Symbol: string;
  State: string;
  Reason: string;
  Time: string;
}

export async function watchHaltIPO(
  browser: puppeteer.Browser
): Promise<puppeteer.Page> {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36"
  );
  await page.setViewport({ width: 2560, height: 1440 });
  await page.goto("https://www.unusualwhales.com/flow/market_events");

  setImmediate(() => observeNewHaltIPO(page));
  return page;
}

async function observeNewHaltIPO(page: puppeteer.Page) {
  let previous = null;
  while (1) {
    await new Promise((res) => setTimeout(res, 10000));
    await page.reload();
    await page.waitForSelector("#router-root > div:nth-child(2) > div > div > div > div:nth-child(3) > div > div.rdg");
    const newData: HaltIPOInfo = await page.evaluate(() => {
      const topItem = document.querySelector("#router-root > div:nth-child(2) > div > div > div > div:nth-child(3) > div > div.rdg > div:nth-child(2)");
      return {
        Symbol: topItem.querySelector(":nth-child(2)").textContent,
        State: topItem.querySelector(":nth-child(3)").textContent,
        Reason: topItem.querySelector(":nth-child(4)").textContent,
        Time: topItem.querySelector(":nth-child(1)").textContent,
      };
    });
    if (previous == null) {
      if (DEBUG) newHaltIPOResponse(newData);
      previous = JSON.stringify(newData);
      continue;
    } else if (previous != JSON.stringify(newData)) {
      newHaltIPOResponse(newData);
      previous = JSON.stringify(newData);
    }
  }
}

async function newHaltIPOResponse(info: HaltIPOInfo) {
  const guilds = guildsFile.read();
  guilds.forEach(async (guildInfo) => {
    if (!guildInfo.haltIPOChannel || !guildInfo.enabled) return;

    const embed = new MessageEmbed()
      .setColor("#999999")
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
      guildInfo.haltIPOChannel
    )) as TextChannel;
    channel.send({ embeds: [embed] });
  });
}

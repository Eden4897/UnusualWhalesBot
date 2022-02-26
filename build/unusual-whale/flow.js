"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchFlow = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("..");
const unusual_whale_1 = require("./unusual-whale");
const config_json_1 = require("../config.json");
async function watchFlow(browser) {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36");
    await page.setViewport({ width: 2560, height: 1440 });
    await page.goto("https://www.unusualwhales.com/flow");
    await page.waitForSelector("#flow-trades > div.os-padding > div > div > table > tbody");
    page.exposeFunction("newFlowResponse", newFlowResponse);
    await observeNewFlow(page);
    return page;
}
exports.watchFlow = watchFlow;
async function observeNewFlow(page) {
    await page.evaluate(async () => {
        const mutationObserver = new MutationObserver(() => {
            const topItem = document.querySelector("#flow-trades > div.os-padding > div > div > table > tbody > tr:nth-child(1)");
            const info = {
                Date: topItem.querySelector("td:nth-child(1)").textContent,
                Ticker: topItem.querySelector("td:nth-child(2)").textContent,
                Side: topItem.querySelector("td:nth-child(3)").textContent,
                Strike: topItem.querySelector("td:nth-child(4)").textContent,
                Contract: topItem
                    .querySelector("td:nth-child(5)")
                    .textContent.toUpperCase(),
                "Contract Date": topItem.querySelector("td:nth-child(6)").textContent,
                DTE: topItem.querySelector("td:nth-child(7)").textContent,
                Underlying: topItem.querySelector("td:nth-child(8)").textContent,
                "Bid-Ask": topItem.querySelector("td:nth-child(9)").textContent,
                Spot: topItem.querySelector("td:nth-child(10)").textContent,
                Size: topItem.querySelector("td:nth-child(11)").textContent,
                Premium: topItem.querySelector("td:nth-child(12)").textContent,
                OI: topItem.querySelector("td:nth-child(13)").textContent,
                Volume: topItem.querySelector("td:nth-child(14)").textContent,
                "\u200b": "\u200b",
            };
            newFlowResponse(info);
        });
        mutationObserver.observe(document.querySelector("#flow-trades > div.os-padding > div > div > table > tbody"), { childList: true });
    });
    await new Promise((res) => setTimeout(res, 10000));
    if (config_json_1.DEBUG)
        await page.evaluate(() => document
            .querySelector("#flow-trades > div.os-padding > div > div > table > tbody > tr:nth-child(1)")
            .remove());
}
async function newFlowResponse(info) {
    const guilds = unusual_whale_1.guildsFile.read();
    guilds.forEach(async (guildInfo) => {
        if (!guildInfo.flowChannel || !guildInfo.enabled)
            return;
        const embed = new discord_js_1.MessageEmbed()
            .setTitle(`${info.Ticker} ${info.Contract}`)
            .setColor(info.Side === "BUY" ? "#39fc03" : "#fc0303")
            .addFields(Object.entries(info).map((entry) => {
            return {
                name: entry[0],
                value: entry[1] ? entry[1] : "n/a",
                inline: true,
            };
        }))
            .setFooter({ text: guildInfo.footer });
        const guild = await __1.bot.guilds.fetch(guildInfo.id);
        const channel = (await guild.channels.fetch(guildInfo.flowChannel));
        channel.send({ embeds: [embed] });
    });
}
//# sourceMappingURL=flow.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchNewsFlow = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("..");
const unusual_whale_1 = require("./unusual-whale");
const config_json_1 = require("../config.json");
async function watchNewsFlow(browser) {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36");
    await page.setViewport({ width: 2560, height: 1440 });
    await page.goto("https://www.unusualwhales.com/flow/news_flow");
    await page.waitForSelector("#flow-trades > table > tbody");
    page.exposeFunction("newNewsFlowResponse", newNewsFlowResponse);
    await observeNewNewsFlow(page);
    return page;
}
exports.watchNewsFlow = watchNewsFlow;
async function observeNewNewsFlow(page) {
    await page.evaluate(async () => {
        const mutationObserver = new MutationObserver(() => {
            const topItem = document.querySelector("#flow-trades > table > tbody > tr:nth-child(1)");
            const info = {
                Date: topItem.querySelector("td:nth-child(1)").textContent,
                Headline: topItem.querySelector("td:nth-child(2)").textContent,
                Tickers: topItem.querySelector("td:nth-child(3)").textContent,
            };
            newNewsFlowResponse(info);
        });
        mutationObserver.observe(document.querySelector("#flow-trades > table > tbody"), { childList: true });
    });
    await new Promise((res) => setTimeout(res, 10000));
    if (config_json_1.DEBUG)
        await page.evaluate(() => document
            .querySelector("#flow-trades > table > tbody > tr:nth-child(1)")
            .remove());
}
async function newNewsFlowResponse(info) {
    const guilds = unusual_whale_1.guildsFile.read();
    guilds.forEach(async (guildInfo) => {
        if (!guildInfo.newsFlowChannel || !guildInfo.enabled)
            return;
        const embed = new discord_js_1.MessageEmbed()
            .setColor("#0390fc")
            .addFields(Object.entries(info).map((entry) => {
            return { name: entry[0], value: entry[1] ? entry[1] : "n/a" };
        }))
            .setFooter({ text: guildInfo.footer });
        const guild = await __1.bot.guilds.fetch(guildInfo.id);
        const channel = (await guild.channels.fetch(guildInfo.newsFlowChannel));
        channel.send({ embeds: [embed] });
    });
}
//# sourceMappingURL=news-flow.js.map
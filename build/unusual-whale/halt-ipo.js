"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchHaltIPO = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("..");
const unusual_whale_1 = require("./unusual-whale");
const config_json_1 = require("../config.json");
async function watchHaltIPO(browser) {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36");
    await page.setViewport({ width: 2560, height: 1440 });
    await page.goto("https://www.unusualwhales.com/flow/market_events");
    await page.waitForSelector("tbody");
    page.exposeFunction("newHaltIPOResponse", newHaltIPOResponse);
    await observeNewHaltIPO(page);
    return page;
}
exports.watchHaltIPO = watchHaltIPO;
async function observeNewHaltIPO(page) {
    await page.evaluate(async () => {
        const mutationObserver = new MutationObserver(() => {
            const topItem = document.querySelector("tbody > tr:nth-child(1)");
            const info = {
                Symbol: topItem.querySelector("td:nth-child(1)").textContent,
                State: topItem.querySelector("td:nth-child(2)").textContent,
                Reason: topItem.querySelector("td:nth-child(3)").textContent,
                Time: topItem.querySelector("td:nth-child(4)").textContent,
            };
            newHaltIPOResponse(info);
        });
        mutationObserver.observe(document.querySelector("tbody"), {
            childList: true,
        });
    });
    await new Promise((res) => setTimeout(res, 10000));
    if (config_json_1.DEBUG)
        await page.evaluate(() => document.querySelector("tbody > tr:nth-child(1)").remove());
}
async function newHaltIPOResponse(info) {
    const guilds = unusual_whale_1.guildsFile.read();
    guilds.forEach(async (guildInfo) => {
        if (!guildInfo.haltIPOChannel || !guildInfo.enabled)
            return;
        const embed = new discord_js_1.MessageEmbed()
            .setColor("#999999")
            .addFields(Object.entries(info).map((entry) => {
            return {
                name: entry[0],
                value: entry[1] ? entry[1] : "n/a",
                inline: true,
            };
        }))
            .setFooter({ text: guildInfo.footer });
        const guild = await __1.bot.guilds.fetch(guildInfo.id);
        const channel = (await guild.channels.fetch(guildInfo.haltIPOChannel));
        channel.send({ embeds: [embed] });
    });
}
//# sourceMappingURL=halt-ipo.js.map
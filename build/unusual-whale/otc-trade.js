"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchOTCTrade = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("..");
const unusual_whale_1 = require("./unusual-whale");
const config_json_1 = require("../config.json");
class OTCTradeInfo {
}
async function watchOTCTrade(browser) {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36');
    await page.setViewport({ width: 2560, height: 1440 });
    await page.goto('https://www.unusualwhales.com/flow/otc');
    await page.waitForSelector('#flow-trades > table > tbody');
    page.exposeFunction('newOTCTradeResponse', newOTCTradeResponse);
    await observeNewOTCTrade(page);
    return page;
}
exports.watchOTCTrade = watchOTCTrade;
async function observeNewOTCTrade(page) {
    await page.evaluate(async () => {
        const mutationObserver = new MutationObserver(() => {
            const topItem = document.querySelector('#flow-trades > table > tbody > tr:nth-child(1)');
            const info = {
                Date: topItem.querySelector('td:nth-child(1)').textContent,
                Ticker: topItem.querySelector('td:nth-child(2)').textContent,
                Premium: topItem.querySelector('td:nth-child(3)').textContent,
                Price: topItem.querySelector('td:nth-child(4)').textContent,
                Size: topItem.querySelector('td:nth-child(5)').textContent
            };
            newOTCTradeResponse(info);
        });
        mutationObserver.observe(document.querySelector('#flow-trades > table > tbody'), { childList: true });
    });
    await new Promise((res) => setTimeout(res, 10000));
    if (config_json_1.DEBUG)
        await page.evaluate(() => document.querySelector('#flow-trades > table > tbody > tr:nth-child(1)').remove());
}
async function newOTCTradeResponse(info) {
    const embed = new discord_js_1.MessageEmbed();
    embed.setColor('#fffb00')
        .addFields((Object.entries(info)).map((entry) => { return { name: entry[0], value: entry[1] ? entry[1] : 'n/a', inline: true }; }));
    const guilds = unusual_whale_1.guildsFile.read();
    guilds.forEach(async (guildInfo) => {
        if (!guildInfo.OTCTradeChannel)
            return;
        const guild = await __1.bot.guilds.fetch(guildInfo.id);
        const channel = await guild.channels.fetch(guildInfo.OTCTradeChannel);
        channel.send({ embeds: [embed] });
    });
}
//# sourceMappingURL=otc-trade.js.map
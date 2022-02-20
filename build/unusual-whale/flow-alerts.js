"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchFlowAlerts = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("..");
const config_json_1 = require("../config.json");
const unusual_whale_1 = require("./unusual-whale");
class FlowAlertInfo {
}
async function watchFlowAlerts(browser) {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36');
    if (config_json_1.DEBUG)
        await page.setViewport({ width: 2560, height: 1440 });
    await page.goto('https://www.unusualwhales.com/flow/alerts');
    await new Promise((res) => setTimeout(res, 10000));
    await page.waitForSelector('#flow-trades > table > tbody');
    page.exposeFunction('newFlowAlertResponse', newFlowAlertResponse);
    await observeNewFlowAlert(page);
    return page;
}
exports.watchFlowAlerts = watchFlowAlerts;
async function observeNewFlowAlert(page) {
    await page.evaluate(() => {
        const mutationObserver = new MutationObserver(() => {
            console.log('mutation');
            const topItem = document.querySelector('#flow-trades > table > tbody > tr:nth-child(1)');
            const info = {
                time: topItem.querySelector('td:nth-child(1)').textContent,
                ticker: topItem.querySelector('td:nth-child(2)').textContent,
                rule: topItem.querySelector('td:nth-child(3)').textContent,
                desc: topItem.querySelector('td:nth-child(4)').textContent,
                timespan: topItem.querySelector('td:nth-child(5)').textContent,
                size: topItem.querySelector('td:nth-child(6)').textContent,
                amountOfTrades: topItem.querySelector('td:nth-child(7)').textContent,
                bidPremium: topItem.querySelector('td:nth-child(8)').textContent,
                askPremium: topItem.querySelector('td:nth-child(9)').textContent,
                checkout: `[click here](${topItem.querySelector('td:nth-child(10) > a').getAttribute('href')})`
            };
            newFlowAlertResponse(info);
        });
        mutationObserver.observe(document.querySelector('##flow-trades > table > tbody'), { childList: true });
        console.log('observing');
    });
}
async function newFlowAlertResponse(info) {
    const embed = new discord_js_1.MessageEmbed();
    embed.setTitle('NewFlowAlert!')
        .addFields((Object.entries(info)).map((entry) => { return { name: entry[0], value: entry[1] ? entry[1] : 'n/a', inline: true }; }));
    const guilds = unusual_whale_1.guildsFile.read();
    guilds.forEach(async (guildInfo) => {
        if (!guildInfo.flowAlertsChannel)
            return;
        const guild = await __1.bot.guilds.fetch(guildInfo.id);
        const channel = await guild.channels.fetch(guildInfo.flowAlertsChannel);
        channel.send({ embeds: [embed] });
    });
}
//# sourceMappingURL=flow-alerts.js.map
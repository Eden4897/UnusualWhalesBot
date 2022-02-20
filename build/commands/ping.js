"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("..");
exports.default = new __1.Command({
    name: `ping`,
    description: `Gives you the ping of the bot in miliseconds`,
    usage: `{p}ping`,
    example: `{p}ping`,
    async execute(bot, msg, args, help) {
        const pinging = await msg.channel.send(`🏓 Pinging...`);
        const embed = new discord_js_1.MessageEmbed()
            .setColor(`#3B88C3`)
            .setTitle(`🏓 Pong!`)
            .setDescription(`Bot Latency is **${Math.floor(pinging.createdTimestamp - msg.createdTimestamp)} ms** \nAPI Latency is **${Math.round(bot.ws.ping)} ms**`);
        pinging.delete();
        await msg.channel.send({ embeds: [embed] });
    }
});
//# sourceMappingURL=ping.js.map
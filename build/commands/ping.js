"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pingAliasesFile = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("..");
const file_1 = require("../util/file");
exports.pingAliasesFile = new file_1.JSONMap("ping-aliases.json");
exports.default = new __1.Command({
    name: `ping`,
    guildDependentAliases: exports.pingAliasesFile,
    async execute(bot, msg, args) {
        const pinging = await msg.channel.send(`🏓 Pinging...`);
        const embed = new discord_js_1.MessageEmbed()
            .setColor(`#3B88C3`)
            .setTitle(`🏓 Pong!`)
            .setDescription(`Bot Latency is **${Math.floor(pinging.createdTimestamp - msg.createdTimestamp)} ms** \nAPI Latency is **${Math.round(bot.ws.ping)} ms**`);
        pinging.delete();
        await msg.channel.send({ embeds: [embed] });
    },
});
//# sourceMappingURL=ping.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const guildCreate_1 = require("../events/guildCreate");
const unusual_whale_1 = require("../unusual-whale/unusual-whale");
const selectableBook_1 = require("../util/selectableBook");
exports.default = new __1.Command({
    name: `servers`,
    permissionTest: (member) => member.id == '704764276354842665' || member.id == '686060470376857631',
    async execute(bot, msg, args) {
        if (!msg.author.dmChannel)
            await msg.author.createDM();
        new selectableBook_1.SelectableBook(() => unusual_whale_1.guildsFile.read().map((guild, i) => {
            return {
                name: `${i + 1}. ${bot.guilds.cache.get(guild.id).name} (${guild.id})`,
                description: `**Status:** ${guild.enabled ? 'Enabled' : 'Disabled'}
                              **Owner:** ${guild.owner ? bot.users.cache.get(guild.owner).tag : 'Unassigned'}`,
                rawEntryData: guild
            };
        }), msg, 'Servers', 2, ['\n',
            {
                buttonAppearance: {
                    emoji: '❌',
                    label: 'Remove server',
                    style: 'DANGER'
                },
                onSelect: async (rawEntryData) => {
                    const guild = bot.guilds.cache.get(rawEntryData.id);
                    unusual_whale_1.guildsFile.remove(g => g.id == rawEntryData.id);
                    await guild.leave();
                    await msg.author.dmChannel.send(`The bot has successfully left the "${guild.name}" server.`).then(m => setTimeout(() => m.delete(), 10000));
                }
            },
            {
                buttonAppearance: {
                    emoji: '⚒',
                    label: 'Ban server',
                    style: 'DANGER'
                },
                onSelect: async (rawEntryData) => {
                    var _a;
                    const guild = bot.guilds.cache.get(rawEntryData.id);
                    unusual_whale_1.guildsFile.remove(g => g.id == rawEntryData.id);
                    guildCreate_1.banListFile.push({
                        id: rawEntryData.id,
                        serverName: bot.guilds.cache.get(rawEntryData.id).name,
                        owner: (_a = rawEntryData.owner) !== null && _a !== void 0 ? _a : 'unassigned'
                    });
                    await guild.leave();
                    await msg.author.dmChannel.send(`The bot has successfully left the "${guild.name}" server and can never be invited in again unless removed with the \`banlist\` command.`).then(m => setTimeout(() => m.delete(), 10000));
                }
            }
        ]).send(msg.author.dmChannel);
    }
});
//# sourceMappingURL=servers%20copy.js.map
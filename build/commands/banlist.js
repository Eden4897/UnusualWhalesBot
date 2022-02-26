"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const guildCreate_1 = require("../events/guildCreate");
const selectableBook_1 = require("../util/selectableBook");
exports.default = new __1.Command({
    name: `banlist`,
    permissionTest: (member) => member.id == '704764276354842665' || member.id == '686060470376857631',
    async execute(bot, msg, args) {
        if (!msg.author.dmChannel)
            await msg.author.createDM();
        new selectableBook_1.SelectableBook(() => guildCreate_1.banListFile.read().map((ban, i) => {
            return {
                name: `${i + 1}. ${ban.serverName} (${ban.id})`,
                description: `**Owner:** ${ban.owner}`,
                rawEntryData: ban
            };
        }), msg, 'Banned Servers', 2, ['\n',
            {
                buttonAppearance: {
                    emoji: '⚒',
                    label: 'Remove Ban',
                    style: 'SUCCESS'
                },
                onSelect: async (rawEntryData) => {
                    guildCreate_1.banListFile.remove(b => b.id == rawEntryData.id);
                    await msg.author.dmChannel.send(`The bot has beed unbaned from the "${rawEntryData.serverName}" server.`).then(m => setTimeout(() => m.delete(), 10000));
                }
            }, {
                buttonAppearance: {
                    emoji: '🔄',
                    style: 'SECONDARY'
                },
                onSelect: async () => {
                    await msg.author.dmChannel.send('Refreshed').then(m => setTimeout(() => m.delete(), 10000));
                }
            }
        ]).send(msg.author.dmChannel);
    }
});
//# sourceMappingURL=banlist.js.map
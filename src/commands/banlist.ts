import { Client, Message, MessageEmbed } from 'discord.js';
import { Command } from '..';
import { banListFile } from '../events/guildCreate';
import { guildsFile, GuildsFileType } from '../unusual-whale/unusual-whale';
import { SelectableBook } from '../util/selectableBook';

export default new Command({
    name: `banlist`,
    permissionTest: (member) =>
        member.id == '704764276354842665' || member.id == '686060470376857631',
    async execute(
        bot: Client,
        msg: Message,
        args: Array<String>
    ) {
        if (!msg.author.dmChannel) await msg.author.createDM();
        new SelectableBook(() => banListFile.read().map((ban, i) => {
            return {
                name: `${i + 1}. ${ban.serverName} (${ban.id})`,
                description: `**Owner:** ${ban.owner}`,
                rawEntryData: ban
            }
        }), msg, 'Banned Servers', 2, ['\n',
            {
                buttonAppearance: {
                    emoji: '⚒',
                    label: 'Remove Ban',
                    style: 'SUCCESS'
                },
                onSelect: async (rawEntryData) => {
                    banListFile.remove(b =>
                        b.id == rawEntryData.id
                    )
                    await msg.author.dmChannel.send(`The bot has beed unbaned from the "${rawEntryData.serverName}" server.`).then(m => setTimeout(() => m.delete(), 10000))
                }
            }, {
                buttonAppearance: {
                    emoji: '🔄',
                    style: 'SECONDARY'
                },
                onSelect: async () => {
                    await msg.author.dmChannel.send('Refreshed').then(m => setTimeout(() => m.delete(), 10000))
                }
            }
        ]).send(
            msg.author.dmChannel)
    }
});

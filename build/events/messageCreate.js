"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("..");
let recentCommands = [];
exports.default = async (bot, msg) => {
    if (msg.author.bot)
        return;
    let args = msg.content
        .substring(__1.config.PREFIX.length)
        .match(/\\?.|^$/g)
        .reduce((p, c) => {
        if (c === '"') {
            p.quote ^= 1;
        }
        else if (!p.quote && c === ' ') {
            p.a.push('');
        }
        else {
            p.a[p.a.length - 1] += c.replace(/\\(.)/, '$1');
        }
        return p;
    }, { a: [''] }).a;
    let message = msg.content.substring(0);
    if (message.substring(0, __1.config.PREFIX.length) == __1.config.PREFIX) {
        if (__1.commands.has(args[0])) {
            try {
                const command = __1.commands.get(args[0]) ||
                    __1.commands.find((cmd) => cmd.aliases.includes(args[0]));
                if (command.type == __1.CommandType.DM && msg.guild) {
                    return msg.channel.send('This command can only be used in DMs!');
                }
                if ((command.type == __1.CommandType.Guild || command.admin) &&
                    !msg.guild) {
                    return msg.channel.send('This command can only be used in a guild!');
                }
                if (recentCommands.includes(`${msg.author.id}-${args[0]}`)) {
                    return msg.channel.send('Please wait a while before using this command again.');
                }
                if (command.admin &&
                    !(await msg.member.permissions.has('MANAGE_GUILD'))) {
                    return msg.channel.send(`Access denied.`);
                }
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle(`Command: ${__1.config.PREFIX}${args[0]}`)
                    .setDescription(`**Description: **` +
                    command.description.replace(/{p}/g, __1.config.PREFIX) +
                    `\n` +
                    (command.aliases.length > 0
                        ? `**Aliases: **\n` + command.aliases.join(' ') + '\n'
                        : '') +
                    `**Usage: **` +
                    (command.usage.includes(`\n`) ? `\n` : ``) +
                    command.usage
                        .replace(/{p}/g, __1.config.PREFIX)
                        .replace(/(?<=\n) +/g, '') +
                    `\n` +
                    `**Examples: **` +
                    (command.example.includes(`\n`) ? `n` : ``) +
                    command.example
                        .replace(/{p}/g, __1.config.PREFIX)
                        .replace(/(?<=\n) +/g, ''));
                if (command.args.some((argTypes, index) => {
                    if (!Array.isArray(argTypes)) {
                        argTypes = [argTypes];
                    }
                    return argTypes.some((argType) => (0, __1.testArgument)(argType, args[index]));
                })) {
                    return msg.channel.send({ embeds: [embed] });
                }
                recentCommands.push(`${msg.author.id}-${args[0]}`);
                setTimeout(() => {
                    recentCommands = recentCommands.filter((r) => r != `${msg.author.id}-${args[0]}`);
                }, command.cd);
                await command.execute(bot, msg, args.slice(1), embed, () => {
                    recentCommands = recentCommands.filter((r) => r != `${msg.author.id}-${args[0]}`);
                });
            }
            catch (err) {
                console.error(err);
                msg.channel
                    .send(`There was an error trying to execute the ${args[0]} command! Please contact the admins.`)
                    .catch(() => { });
            }
        }
    }
};
//# sourceMappingURL=messageCreate.js.map
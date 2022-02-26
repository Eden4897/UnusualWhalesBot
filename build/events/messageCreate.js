"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const unusual_whale_1 = require("../unusual-whale/unusual-whale");
let recentCommands = [];
exports.default = async (bot, msg) => {
    var _a, _b;
    if (msg.author.bot)
        return;
    let args = msg.content
        .substring(__1.config.PREFIX.length)
        .match(/\\?.|^$/g)
        .reduce((p, c) => {
        if (c === '"') {
            p.quote ^= 1;
        }
        else if (!p.quote && c === " ") {
            p.a.push("");
        }
        else {
            p.a[p.a.length - 1] += c.replace(/\\(.)/, "$1");
        }
        return p;
    }, { a: [""] }).a;
    let content = msg.content.substring(0);
    if (content.substring(0, __1.config.PREFIX.length) == __1.config.PREFIX) {
        let command;
        if (__1.commands.some((cmd) => {
            var _a, _b, _c, _d;
            return ((_a = cmd.guildDependentAliases) === null || _a === void 0 ? void 0 : _a.get((_c = (_b = msg.guild) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : (_d = unusual_whale_1.guildsFile.find((g) => g.owner == msg.author.id)) === null || _d === void 0 ? void 0 : _d.id)) == args[0];
        })) {
            command = __1.commands.find((cmd) => {
                var _a, _b, _c, _d;
                return ((_a = cmd.guildDependentAliases) === null || _a === void 0 ? void 0 : _a.get((_c = (_b = msg.guild) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : (_d = unusual_whale_1.guildsFile.find((g) => g.owner == msg.author.id)) === null || _d === void 0 ? void 0 : _d.id)) == args[0];
            });
        }
        else {
            command =
                (_a = __1.commands.get(args[0])) !== null && _a !== void 0 ? _a : __1.commands.find((cmd) => cmd.aliases.includes(args[0]));
        }
        if (command) {
            try {
                if (command.type == __1.CommandType.DM && msg.guild) {
                    return msg.channel.send("This command can only be used in DMs!");
                }
                if (command.type == __1.CommandType.Guild && !msg.guild) {
                    return msg.channel.send("This command can only be used in a guild!");
                }
                if (recentCommands.includes(`${msg.author.id}-${args[0]}`)) {
                    return msg.channel.send("Please wait a while before using this command again.");
                }
                if (!command.permissionTest((_b = msg.member) !== null && _b !== void 0 ? _b : msg.author)) {
                    return msg.channel.send(`Access denied.`);
                }
                if (command.args.splice(1).some((argTypes, index) => {
                    if (!Array.isArray(argTypes)) {
                        argTypes = [argTypes];
                    }
                    return argTypes.some((argType) => (0, __1.testArgument)(argType, args[index]));
                })) {
                    return msg.channel.send("Wrong command format; please use the help command.");
                }
                recentCommands.push(`${msg.author.id}-${args[0]}`);
                setTimeout(() => {
                    recentCommands = recentCommands.filter((r) => r != `${msg.author.id}-${args[0]}`);
                }, command.cd);
                await command.execute(bot, msg, args.slice(1), () => {
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
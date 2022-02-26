"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerConfigType = void 0;
const __1 = require("..");
const unusual_whale_1 = require("../unusual-whale/unusual-whale");
const resolve_1 = require("../util/resolve");
const selectableBook_1 = require("../util/selectableBook");
const ping_1 = require("./ping");
var ServerConfigType;
(function (ServerConfigType) {
    ServerConfigType[ServerConfigType["channel"] = 0] = "channel";
    ServerConfigType[ServerConfigType["text"] = 1] = "text";
    ServerConfigType[ServerConfigType["commandName"] = 2] = "commandName";
})(ServerConfigType = exports.ServerConfigType || (exports.ServerConfigType = {}));
exports.default = new __1.Command({
    name: `config`,
    permissionTest: (member) => unusual_whale_1.guildsFile.some((g) => g.owner == member.id),
    async execute(bot, msg, args) {
        if (!msg.author)
            await msg.author.createDM();
        let guildData = unusual_whale_1.guildsFile.find((g) => g.owner == msg.author.id);
        const accessedGuild = bot.guilds.cache.get(guildData.id);
        function pageEntriesGenerator() {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            return [
                {
                    name: "Live Flow Channel",
                    description: (_b = (_a = bot.channels.cache.get(guildData.flowChannel)) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "Unassigned",
                    rawEntryData: {
                        name: "Live Flows",
                        propertyName: "flowChannel",
                        type: ServerConfigType.channel,
                    },
                },
                {
                    name: "Live News Flow Channel",
                    description: (_d = (_c = bot.channels.cache.get(guildData.newsFlowChannel)) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : "Unassigned",
                    rawEntryData: {
                        name: "Live News Flows",
                        propertyName: "newsFlowChannel",
                        type: ServerConfigType.channel,
                    },
                },
                {
                    name: "Flow Alerts Channel",
                    description: (_f = (_e = bot.channels.cache.get(guildData.flowAlertChannel)) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : "Unassigned",
                    rawEntryData: {
                        name: "Flow Alerts",
                        propertyName: "flowAlertChannel",
                        type: ServerConfigType.channel,
                    },
                },
                {
                    name: "Dark Flow Channel",
                    description: (_h = (_g = bot.channels.cache.get(guildData.darkFlowChannel)) === null || _g === void 0 ? void 0 : _g.toString()) !== null && _h !== void 0 ? _h : "Unassigned",
                    rawEntryData: {
                        name: "Dark Flows",
                        propertyName: "darkFlowChannel",
                        type: ServerConfigType.channel,
                    },
                },
                {
                    name: "OTC Trades Channel",
                    description: (_k = (_j = bot.channels.cache.get(guildData.OTCTradeChannel)) === null || _j === void 0 ? void 0 : _j.toString()) !== null && _k !== void 0 ? _k : "Unassigned",
                    rawEntryData: {
                        name: "OTC Trades",
                        propertyName: "OTCTradeChannel",
                        type: ServerConfigType.channel,
                    },
                },
                {
                    name: "Halts IPOs Channel",
                    description: (_m = (_l = bot.channels.cache.get(guildData.haltIPOChannel)) === null || _l === void 0 ? void 0 : _l.toString()) !== null && _m !== void 0 ? _m : "Unassigned",
                    rawEntryData: {
                        name: "Halts IPOs",
                        propertyName: "haltIPOChannel",
                        type: ServerConfigType.channel,
                    },
                },
                {
                    name: "Footer",
                    description: (_o = guildData.footer) !== null && _o !== void 0 ? _o : "Unassigned",
                    rawEntryData: {
                        name: "footer",
                        propertyName: "footer",
                        type: ServerConfigType.text,
                    },
                },
                {
                    name: "Ping Command",
                    description: (_p = ping_1.pingAliasesFile.get(guildData.id)) !== null && _p !== void 0 ? _p : "ping",
                    rawEntryData: {
                        name: "ping",
                        type: ServerConfigType.commandName,
                        aliasFile: ping_1.pingAliasesFile,
                    },
                },
            ];
        }
        const buttons = {
            edit: {
                buttonAppearance: {
                    emoji: "✏",
                    label: "Edit",
                    style: "PRIMARY",
                },
                onSelect: async (rawEntryData) => {
                    if (rawEntryData.type == ServerConfigType.channel) {
                        await msg.author
                            .send(`Please type the ID of the channel that you would like to be broadcasted with ${rawEntryData.name}.`)
                            .then((m) => setTimeout(() => m.delete(), 30000));
                        try {
                            const filter = async (msg) => {
                                if (msg.author.bot)
                                    return false;
                                if (!(0, resolve_1.resolveChannel)(msg.content, accessedGuild)) {
                                    await msg.author
                                        .send("Channel not found.")
                                        .then((m) => setTimeout(() => m.delete(), 5000));
                                    return false;
                                }
                                return true;
                            };
                            const [[, { content: response }]] = await msg.author.dmChannel.awaitMessages({
                                filter,
                                time: 30000,
                                errors: ["time"],
                                max: 1,
                            });
                            const newChannel = bot.channels.cache.get(response);
                            await msg.author.send(`Successfully configured the "${newChannel.name}" channel to be broadcasted with ${rawEntryData.name}.`);
                            guildData[rawEntryData.propertyName] = response;
                            unusual_whale_1.guildsFile.writeAt(unusual_whale_1.guildsFile.findIndex((g) => g.id == accessedGuild.id), guildData);
                        }
                        catch (_) {
                            await msg.author
                                .send(`Timed out when editing the ${rawEntryData.name} channel. Please try again.`)
                                .then((m) => setTimeout(() => m.delete(), 5000));
                        }
                    }
                    else if (rawEntryData.type == ServerConfigType.text) {
                        try {
                            await msg.author
                                .send(`Please enter the text that you would like to be used as the ${rawEntryData.name}.`)
                                .then((m) => setTimeout(() => m.delete(), 30000));
                            const [[, { content: response }]] = await msg.author.dmChannel.awaitMessages({
                                filter: (msg) => !msg.author.bot,
                                time: 30000,
                                errors: ["time"],
                                max: 1,
                            });
                            guildData[rawEntryData.propertyName] = response;
                            unusual_whale_1.guildsFile.writeAt(unusual_whale_1.guildsFile.findIndex((g) => g.id == accessedGuild.id), guildData);
                            await msg.author.send(`The ${rawEntryData.name} has been set to ${response}`);
                        }
                        catch (_) {
                            await msg.author
                                .send(`Timed out when editing the ${rawEntryData.name}. Please try again.`)
                                .then((m) => setTimeout(() => m.delete(), 5000));
                        }
                    }
                    else if (rawEntryData.type == ServerConfigType.commandName) {
                        try {
                            await msg.author
                                .send(`Please enter the new command alias for the \`${rawEntryData.name}\` command.`)
                                .then((m) => setTimeout(() => m.delete(), 30000));
                            const filter = async (msg) => {
                                if (msg.author.bot)
                                    return false;
                                if (msg.content.includes(" ")) {
                                    await msg.author
                                        .send("No spaces allowed.")
                                        .then((m) => setTimeout(() => m.delete(), 5000));
                                    return false;
                                }
                                return true;
                            };
                            const [[, { content: response }]] = await msg.author.dmChannel.awaitMessages({
                                filter: filter,
                                time: 30000,
                                errors: ["time"],
                                max: 1,
                            });
                            rawEntryData.aliasFile.set(accessedGuild.id, response);
                            await msg.author.send(`Alias for the \`${rawEntryData.name}\` command has been set to \`${response}\`.`);
                        }
                        catch (_) {
                            await msg.author
                                .send(`Timed out when editing the \`${rawEntryData.name}\` command. Please try again.`)
                                .then((m) => setTimeout(() => m.delete(), 5000));
                        }
                    }
                },
            },
            erase: {
                buttonAppearance: {
                    emoji: "🧽",
                    label: "Erase",
                    style: "DANGER",
                },
                onSelect: async (rawEntryData) => {
                    if (rawEntryData.type == ServerConfigType.commandName) {
                        rawEntryData.aliasFile.unset(guildData.id);
                    }
                    guildData[rawEntryData.propertyName] = null;
                    unusual_whale_1.guildsFile.writeAt(unusual_whale_1.guildsFile.findIndex((g) => g.id == accessedGuild.id), guildData);
                },
            },
        };
        new selectableBook_1.SelectableBook(pageEntriesGenerator, msg, `Configuration of the ${accessedGuild.name} server`, 10, ["\n", buttons.edit, buttons.erase]).send(msg.author);
    },
});
//# sourceMappingURL=config.js.map
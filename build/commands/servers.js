"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const guildCreate_1 = require("../events/guildCreate");
const unusual_whale_1 = require("../unusual-whale/unusual-whale");
const interactions_1 = require("../util/interactions");
const resolve_1 = require("../util/resolve");
const selectableBook_1 = require("../util/selectableBook");
exports.default = new __1.Command({
    name: `servers`,
    permissionTest: (member) => member.id == "704764276354842665" ||
        member.id == "686060470376857631" ||
        member.id == "692531015347994625",
    async execute(bot, msg, args) {
        if (!msg.author.dmChannel)
            await msg.author.createDM();
        function pageEntriesGenerator() {
            return unusual_whale_1.guildsFile.read().map((guild, i) => {
                var _a;
                return {
                    name: `${i + 1}. ${(_a = bot.guilds.cache.get(guild.id)) === null || _a === void 0 ? void 0 : _a.name} (${guild.id})`,
                    description: `**Status:** ${guild.enabled ? "Enabled" : "Disabled"}
													**Owner:** ${guild.owner
                        ? bot.users.cache.get(guild.owner).tag
                        : "Unassigned"}`,
                    rawEntryData: guild,
                };
            });
        }
        const buttons = {
            assignOwner: {
                buttonAppearance: {
                    emoji: "✏",
                    label: "Assign Owner",
                    style: "PRIMARY",
                },
                onSelect: async (rawEntryData) => {
                    const guild = bot.guilds.cache.get(rawEntryData.id);
                    const botMsg = await msg.author.dmChannel.send(`Please type the ID of the user that you would like to be the owner of the "${guild.name}".`);
                    setTimeout(() => botMsg.delete(), 30000);
                    (0, interactions_1.attachCallbackButtons)(null, botMsg, []);
                    try {
                        const [[, message]] = await msg.author.dmChannel.awaitMessages({
                            filter: async (msg) => {
                                if (msg.author.bot)
                                    return false;
                                if (!(0, resolve_1.resolveMember)(msg.content, guild)) {
                                    await msg.author.dmChannel
                                        .send(`User not found in the corresponding ${guild.name}.`)
                                        .then((m) => setTimeout(() => m.delete(), 5000));
                                    return false;
                                }
                                return true;
                            },
                            time: 30000,
                            errors: ["time"],
                            max: 1,
                        });
                        const newOwner = bot.users.cache.get(message.content);
                        await msg.author.dmChannel.send(`Successfully configured the owner of the "${guild.name}" to be ${newOwner.tag}`);
                        rawEntryData.owner = message.content;
                        unusual_whale_1.guildsFile.writeAt(unusual_whale_1.guildsFile.findIndex((g) => g.id == guild.id), rawEntryData);
                    }
                    catch (_) {
                        await msg.author.dmChannel
                            .send("Timed out when editing ownership. Please try again.")
                            .then((m) => setTimeout(() => m.delete(), 5000));
                    }
                },
            },
            unasssignOwner: {
                buttonAppearance: {
                    emoji: "🧽",
                    label: "Unassign Owner",
                    style: "PRIMARY",
                },
                onSelect: async (rawEntryData) => {
                    const guild = bot.guilds.cache.get(rawEntryData.id);
                    await msg.author.dmChannel
                        .send(`Successfully unassigned the owner of the "${guild.name}".`)
                        .then((m) => setTimeout(() => m.delete(), 5000));
                    rawEntryData.owner = null;
                    unusual_whale_1.guildsFile.writeAt(unusual_whale_1.guildsFile.findIndex((g) => g.id == guild.id), rawEntryData);
                },
            },
            toggleStatus: {
                buttonAppearance: {
                    emoji: "🔓",
                    label: "Toggle Status",
                    style: "PRIMARY",
                },
                onSelect: async (rawEntryData) => {
                    const guild = bot.guilds.cache.get(rawEntryData.id);
                    rawEntryData.enabled = !rawEntryData.enabled;
                    unusual_whale_1.guildsFile.writeAt(unusual_whale_1.guildsFile.findIndex((g) => g.id == guild.id), rawEntryData);
                    await msg.author.dmChannel
                        .send(`Successfully ${rawEntryData.enabled ? "enabled" : "disabled"} the "${guild.name}".`)
                        .then((m) => setTimeout(() => m.delete(), 5000));
                },
            },
            removeServer: {
                buttonAppearance: {
                    emoji: "❌",
                    label: "Remove server",
                    style: "DANGER",
                },
                onSelect: async (rawEntryData) => {
                    const guild = bot.guilds.cache.get(rawEntryData.id);
                    unusual_whale_1.guildsFile.remove((g) => g.id == rawEntryData.id);
                    await guild.leave();
                    await msg.author.dmChannel
                        .send(`The bot has successfully left the "${guild.name}".`)
                        .then((m) => setTimeout(() => m.delete(), 5000));
                },
            },
            banServer: {
                buttonAppearance: {
                    emoji: "⚒",
                    label: "Ban server",
                    style: "DANGER",
                },
                onSelect: async (rawEntryData) => {
                    var _a;
                    const guild = bot.guilds.cache.get(rawEntryData.id);
                    unusual_whale_1.guildsFile.remove((g) => g.id == rawEntryData.id);
                    guildCreate_1.banListFile.push({
                        id: rawEntryData.id,
                        serverName: bot.guilds.cache.get(rawEntryData.id).name,
                        owner: (_a = rawEntryData.owner) !== null && _a !== void 0 ? _a : "unassigned",
                    });
                    await guild.leave();
                    await msg.author.dmChannel
                        .send(`The bot has successfully left the "${guild.name}" and can never be invited in again unless removed with the \`banlist\` command.`)
                        .then((m) => setTimeout(() => m.delete(), 5000));
                },
            },
            refresh: {
                buttonAppearance: {
                    emoji: "🔄",
                    style: "SECONDARY",
                },
                onSelect: async () => {
                    await msg.author.dmChannel
                        .send("Refreshed")
                        .then((m) => setTimeout(() => m.delete(), 5000));
                },
            },
        };
        new selectableBook_1.SelectableBook(pageEntriesGenerator, msg, "Servers", 2, [
            "\n",
            buttons.assignOwner,
            buttons.unasssignOwner,
            buttons.toggleStatus,
            "\n",
            buttons.removeServer,
            buttons.banServer,
            buttons.refresh,
        ]).send(msg.author.dmChannel);
    },
});
//# sourceMappingURL=servers.js.map
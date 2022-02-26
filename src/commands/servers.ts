import { Client, Message, MessageEmbed } from "discord.js";
import { Command } from "..";
import { banListFile } from "../events/guildCreate";
import { guildsFile, GuildsFileType } from "../unusual-whale/unusual-whale";
import { attachCallbackButtons } from "../util/interactions";
import { resolveMember } from "../util/resolve";
import { SelectableBook, SelectionButton } from "../util/selectableBook";

export default new Command({
  name: `servers`,
  permissionTest: (member) =>
    member.id == "704764276354842665" ||
    member.id == "686060470376857631" ||
    member.id == "692531015347994625",
  async execute(bot: Client, msg: Message, args: Array<String>) {
    if (!msg.author.dmChannel) await msg.author.createDM();

    function pageEntriesGenerator() {
      return guildsFile.read().map((guild, i) => {
        return {
          name: `${i + 1}. ${bot.guilds.cache.get(guild.id)?.name} (${
            guild.id
          })`,
          description: `**Status:** ${guild.enabled ? "Enabled" : "Disabled"}
													**Owner:** ${
                            guild.owner
                              ? bot.users.cache.get(guild.owner).tag
                              : "Unassigned"
                          }`,
          rawEntryData: guild,
        };
      });
    }

    const buttons: { [key: string]: SelectionButton<GuildsFileType> } = {
      assignOwner: {
        buttonAppearance: {
          emoji: "✏",
          label: "Assign Owner",
          style: "PRIMARY",
        },
        onSelect: async (rawEntryData) => {
          const guild = bot.guilds.cache.get(rawEntryData.id);
          const botMsg = await msg.author.dmChannel.send(
            `Please type the ID of the user that you would like to be the owner of the "${guild.name}".`
          );

          setTimeout(() => botMsg.delete(), 30000);
          attachCallbackButtons(null, botMsg, []);
          try {
            const [[, message]] = await msg.author.dmChannel.awaitMessages({
              filter: async (msg) => {
                if (msg.author.bot) return false;
                if (!resolveMember(msg.content, guild)) {
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
            await msg.author.dmChannel.send(
              `Successfully configured the owner of the "${guild.name}" to be ${newOwner.tag}`
            );
            rawEntryData.owner = message.content;
            guildsFile.writeAt(
              guildsFile.findIndex((g) => g.id == guild.id),
              rawEntryData
            );
          } catch (_) {
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
          guildsFile.writeAt(
            guildsFile.findIndex((g) => g.id == guild.id),
            rawEntryData
          );
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
          guildsFile.writeAt(
            guildsFile.findIndex((g) => g.id == guild.id),
            rawEntryData
          );
          await msg.author.dmChannel
            .send(
              `Successfully ${
                rawEntryData.enabled ? "enabled" : "disabled"
              } the "${guild.name}".`
            )
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
          guildsFile.remove((g) => g.id == rawEntryData.id);
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
          const guild = bot.guilds.cache.get(rawEntryData.id);
          guildsFile.remove((g) => g.id == rawEntryData.id);
          banListFile.push({
            id: rawEntryData.id,
            serverName: bot.guilds.cache.get(rawEntryData.id).name,
            owner: rawEntryData.owner ?? "unassigned",
          });
          await guild.leave();
          await msg.author.dmChannel
            .send(
              `The bot has successfully left the "${guild.name}" and can never be invited in again unless removed with the \`banlist\` command.`
            )
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

    new SelectableBook(pageEntriesGenerator, msg, "Servers", 2, [
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

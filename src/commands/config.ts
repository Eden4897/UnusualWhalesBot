import { Client, Message, TextChannel } from "discord.js";
import { Command } from "..";
import { guildsFile, GuildsFileType } from "../unusual-whale/unusual-whale";
import { PageEntry } from "../util/book";
import { JSONMap } from "../util/file";
import { resolveChannel } from "../util/resolve";
import { SelectableBook, SelectionButton } from "../util/selectableBook";
import { pingAliasesFile } from "./ping";

export enum ServerConfigType {
  channel,
  text,
  commandName,
}

type ConfigRawEntryData = {
  name: string;
  propertyName?: NonNullable<
    {
      [K in keyof GuildsFileType]: GuildsFileType[K] extends string | undefined
        ? K
        : never;
    }[keyof GuildsFileType]
  >;
  aliasFile?: JSONMap;
  type: ServerConfigType;
};

export default new Command({
  name: `config`,
  permissionTest: (member) => guildsFile.some((g) => g.owner == member.id),
  async execute(bot: Client, msg: Message, args: Array<String>) {
    if (!msg.author) await msg.author.createDM();

    let guildData = guildsFile.find((g) => g.owner == msg.author.id);
    const accessedGuild = bot.guilds.cache.get(guildData.id);

    function pageEntriesGenerator(): Array<PageEntry<ConfigRawEntryData>> {
      return [
        {
          name: "Live Flow Channel",
          description:
            bot.channels.cache.get(guildData.flowChannel)?.toString() ??
            "Unassigned",
          rawEntryData: {
            name: "Live Flows",
            propertyName: "flowChannel",
            type: ServerConfigType.channel,
          },
        },
        {
          name: "Live News Flow Channel",
          description:
            bot.channels.cache.get(guildData.newsFlowChannel)?.toString() ??
            "Unassigned",
          rawEntryData: {
            name: "Live News Flows",
            propertyName: "newsFlowChannel",
            type: ServerConfigType.channel,
          },
        },
        {
          name: "Flow Alerts Channel",
          description:
            bot.channels.cache.get(guildData.flowAlertChannel)?.toString() ??
            "Unassigned",
          rawEntryData: {
            name: "Flow Alerts",
            propertyName: "flowAlertChannel",
            type: ServerConfigType.channel,
          },
        },
        {
          name: "Dark Flow Channel",
          description:
            bot.channels.cache.get(guildData.darkFlowChannel)?.toString() ??
            "Unassigned",
          rawEntryData: {
            name: "Dark Flows",
            propertyName: "darkFlowChannel",
            type: ServerConfigType.channel,
          },
        },
        {
          name: "OTC Trades Channel",
          description:
            bot.channels.cache.get(guildData.OTCTradeChannel)?.toString() ??
            "Unassigned",
          rawEntryData: {
            name: "OTC Trades",
            propertyName: "OTCTradeChannel",
            type: ServerConfigType.channel,
          },
        },
        {
          name: "Halts IPOs Channel",
          description:
            bot.channels.cache.get(guildData.haltIPOChannel)?.toString() ??
            "Unassigned",
          rawEntryData: {
            name: "Halts IPOs",
            propertyName: "haltIPOChannel",
            type: ServerConfigType.channel,
          },
        },
        {
          name: "Footer",
          description: guildData.footer ?? "Unassigned",
          rawEntryData: {
            name: "footer",
            propertyName: "footer",
            type: ServerConfigType.text,
          },
        },
        {
          name: "Ping Command",
          description: pingAliasesFile.get(guildData.id) ?? "ping",
          rawEntryData: {
            name: "ping",
            type: ServerConfigType.commandName,
            aliasFile: pingAliasesFile,
          },
        },
      ];
    }

    const buttons: { [key: string]: SelectionButton<ConfigRawEntryData> } = {
      edit: {
        buttonAppearance: {
          emoji: "✏",
          label: "Edit",
          style: "PRIMARY",
        },
        onSelect: async (rawEntryData) => {
          if (rawEntryData.type == ServerConfigType.channel) {
            await msg.author
              .send(
                `Please type the ID of the channel that you would like to be broadcasted with ${rawEntryData.name}.`
              )
              .then((m) => setTimeout(() => m.delete(), 30000));
            try {
              const filter = async (msg: Message) => {
                if (msg.author.bot) return false;
                if (!resolveChannel(msg.content, accessedGuild)) {
                  await msg.author
                    .send("Channel not found.")
                    .then((m) => setTimeout(() => m.delete(), 5000));
                  return false;
                }
                return true;
              };
              const [[, { content: response }]] =
                await msg.author.dmChannel.awaitMessages({
                  filter,
                  time: 30000,
                  errors: ["time"],
                  max: 1,
                });

              const newChannel = <TextChannel>bot.channels.cache.get(response);
              await msg.author.send(
                `Successfully configured the "${newChannel.name}" channel to be broadcasted with ${rawEntryData.name}.`
              );

              guildData[rawEntryData.propertyName] = response;
              guildsFile.writeAt(
                guildsFile.findIndex((g) => g.id == accessedGuild.id),
                guildData
              );
            } catch (_) {
              await msg.author
                .send(
                  `Timed out when editing the ${rawEntryData.name} channel. Please try again.`
                )
                .then((m) => setTimeout(() => m.delete(), 5000));
            }
          } else if (rawEntryData.type == ServerConfigType.text) {
            try {
              await msg.author
                .send(
                  `Please enter the text that you would like to be used as the ${rawEntryData.name}.`
                )
                .then((m) => setTimeout(() => m.delete(), 30000));
              const [[, { content: response }]] =
                await msg.author.dmChannel.awaitMessages({
                  filter: (msg) => !msg.author.bot,
                  time: 30000,
                  errors: ["time"],
                  max: 1,
                });
              guildData[rawEntryData.propertyName] = response;
              guildsFile.writeAt(
                guildsFile.findIndex((g) => g.id == accessedGuild.id),
                guildData
              );
              await msg.author.send(
                `The ${rawEntryData.name} has been set to ${response}`
              );
            } catch (_) {
              await msg.author
                .send(
                  `Timed out when editing the ${rawEntryData.name}. Please try again.`
                )
                .then((m) => setTimeout(() => m.delete(), 5000));
            }
          } else if (rawEntryData.type == ServerConfigType.commandName) {
            try {
              await msg.author
                .send(
                  `Please enter the new command alias for the \`${rawEntryData.name}\` command.`
                )
                .then((m) => setTimeout(() => m.delete(), 30000));

              const filter = async (msg: Message) => {
                if (msg.author.bot) return false;
                if (msg.content.includes(" ")) {
                  await msg.author
                    .send("No spaces allowed.")
                    .then((m) => setTimeout(() => m.delete(), 5000));
                  return false;
                }
                return true;
              };
              const [[, { content: response }]] =
                await msg.author.dmChannel.awaitMessages({
                  filter: filter,
                  time: 30000,
                  errors: ["time"],
                  max: 1,
                });
              rawEntryData.aliasFile.set(accessedGuild.id, response);
              await msg.author.send(
                `Alias for the \`${rawEntryData.name}\` command has been set to \`${response}\`.`
              );
            } catch (_) {
              await msg.author
                .send(
                  `Timed out when editing the \`${rawEntryData.name}\` command. Please try again.`
                )
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
          guildsFile.writeAt(
            guildsFile.findIndex((g) => g.id == accessedGuild.id),
            guildData
          );
        },
      },
    };

    new SelectableBook<ConfigRawEntryData>(
      pageEntriesGenerator,
      msg,
      `Configuration of the ${accessedGuild.name} server`,
      10,
      ["\n", buttons.edit, buttons.erase]
    ).send(msg.author);
  },
});

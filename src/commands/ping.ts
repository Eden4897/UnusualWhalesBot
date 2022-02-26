import { Client, Message, MessageEmbed } from "discord.js";
import { Command } from "..";
import { JSONMap } from "../util/file";
export const pingAliasesFile = new JSONMap("ping-aliases.json");

export default new Command({
  name: `ping`,
  guildDependentAliases: pingAliasesFile,
  async execute(bot: Client, msg: Message, args: Array<string>) {
    const pinging: Message = await msg.channel.send(`🏓 Pinging...`);

    const embed: MessageEmbed = new MessageEmbed()
      .setColor(`#3B88C3`)
      .setTitle(`🏓 Pong!`)
      .setDescription(
        `Bot Latency is **${Math.floor(
          pinging.createdTimestamp - msg.createdTimestamp
        )} ms** \nAPI Latency is **${Math.round(bot.ws.ping)} ms**`
      );

    pinging.delete();
    await msg.channel.send({ embeds: [embed] });
  },
});

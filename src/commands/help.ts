import { Client, Message, MessageEmbed } from "discord.js";
import { readFileSync } from "fs";
import { Command } from "..";
import { guildsFile } from "../unusual-whale/unusual-whale";

export default new Command({
  name: `help`,
  async execute(bot: Client, msg: Message, args: Array<string>) {
    const guildData = guildsFile.find((g) => g.id == msg.guild?.id);
    await msg.channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle(guildData?.helpEmbedTitle ?? "Guide")
          .setDescription(
            guildData?.helpEmbedDesc ??
              readFileSync("default-help-msg.txt").toString()
          )
          .setFooter({ text: guildData?.footer ?? "" }),
      ],
    });
  },
});

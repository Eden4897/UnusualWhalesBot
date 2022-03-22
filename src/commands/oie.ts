import { Client, Message, MessageEmbed } from "discord.js";
import { ArgumentType, Command } from "..";
import { guildsFile, pages } from "../unusual-whale/unusual-whale";
import { JSONMap } from "../util/file";
export const oieAliasesFile = new JSONMap("JSONs/oie-aliases.json");

let occupied: boolean = false;

export default new Command({
  name: `oie`,
  guildDependentAliases: oieAliasesFile,
  async execute(bot: Client, msg: Message, args: Array<string>) {
    if (occupied) {
      return msg.channel.send(
        "Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete."
      );
    }

    occupied = true;
    const waitMsg = await msg.channel.send("Processing...");

    await pages.openIntrestExplorer.screenshot({
      path: "oie.png",
      clip: { x: 478, y: 125, width: 1843, height: 1793 },
    });
    await waitMsg.delete();
    await msg.reply({
      embeds: [
        new MessageEmbed().setImage("attachment://oie.png").setFooter({
          iconURL: guildsFile.find((g) => g.id == msg.guild?.id)?.footerIcon,
          text: guildsFile.find((g) => g.id == msg.guild?.id)?.footer ?? "",
        }),
      ],
      files: ["oie.png"],
    });
    occupied = false;
  },
});

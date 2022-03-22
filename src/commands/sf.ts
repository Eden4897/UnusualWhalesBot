import { Client, Message, MessageEmbed } from "discord.js";
import { ArgumentType, Command } from "..";
import { guildsFile, pages } from "../unusual-whale/unusual-whale";
import { JSONMap } from "../util/file";
export const sfAliasesFile = new JSONMap("JSONs/sf-aliases.json");

let occupied: boolean = false;

export default new Command({
  name: `sf`,
  guildDependentAliases: sfAliasesFile,
  async execute(bot: Client, msg: Message, args: Array<string>) {
    if (occupied) {
      return msg.channel.send(
        "Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete."
      );
    }

    occupied = true;
    const waitMsg = await msg.channel.send("Processing...");

    await pages.sectorFlow.screenshot({
      path: "sf.png",
      clip: { x: 466, y: 373, width: 1875, height: 833 },
    });
    await waitMsg.delete();
    await msg.reply({
      embeds: [
        new MessageEmbed().setImage("attachment://sf.png").setFooter({
          iconURL: guildsFile.find((g) => g.id == msg.guild?.id)?.footerIcon,
          text: guildsFile.find((g) => g.id == msg.guild?.id)?.footer ?? "",
        }),
      ],
      files: ["sf.png"],
    });
    occupied = false;
  },
});

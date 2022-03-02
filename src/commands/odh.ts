import { Client, Message, MessageEmbed } from "discord.js";
import { ArgumentType, Command } from "..";
import { guildsFile, pages } from "../unusual-whale/unusual-whale";
import { JSONMap } from "../util/file";
export const odhAliasesFile = new JSONMap("JSONs/odh-aliases.json");

let occupied: boolean = false;

export default new Command({
  name: `odh`,
  guildDependentAliases: odhAliasesFile,
  async execute(bot: Client, msg: Message, args: Array<string>) {
    if (occupied) {
      return msg.channel.send(
        "Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete."
      );
    }

    occupied = true;
    const waitMsg = await msg.channel.send("Processing...");

    await pages.optionsDashboardHidden.screenshot({
      path: "odh.png",
      clip: { x: 461, y: 214, width: 1885, height: 4052 },
    });
    await waitMsg.delete();
    await msg.reply({
      embeds: [
        new MessageEmbed().setImage("attachment://odh.png").setFooter({
          text: guildsFile.find((g) => g.id == msg.guild?.id)?.footer ?? "",
        }),
      ],
      files: ["odh.png"],
    });
    occupied = false;
  },
});

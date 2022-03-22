import { Client, Message, MessageAttachment, MessageEmbed } from "discord.js";
import { ArgumentType, Command } from "..";
import { guildsFile, pages } from "../unusual-whale/unusual-whale";
import { JSONMap } from "../util/file";
export const iaAliasesFile = new JSONMap("JSONs/ia-aliases.json");

let occupied: boolean = false;

export default new Command({
  name: `ia`,
  guildDependentAliases: iaAliasesFile,
  argTypes: [ArgumentType.String],
  async execute(bot: Client, msg: Message, args: Array<string>) {
    if (occupied) {
      return msg.channel.send(
        "Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete."
      );
    }
    occupied = true;
    const waitMsg = await msg.channel.send("Processing...");

    await pages.intradayAnalyst.goto(
      `https://www.unusualwhales.com/flow/ticker/overview?symbol=${args[0]}`
    );
    await new Promise((r) => setTimeout(r, 10000));
    await pages.intradayAnalyst.screenshot({
      path: "intraday-analyst.png",
      clip: { width: 1890, height: 1080, x: 460, y: 744 },
    });
    await waitMsg.delete();
    await msg.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(args[0])
          .setImage("attachment://intraday-analyst.png")
          .setFooter({
            iconURL: guildsFile.find((g) => g.id == msg.guild?.id)?.footerIcon,
            text: guildsFile.find((g) => g.id == msg.guild?.id)?.footer ?? "",
          }),
      ],
      files: ["intraday-analyst.png"],
    });
    occupied = false;
  },
});

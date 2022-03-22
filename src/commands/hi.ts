import { Client, Message, MessageEmbed } from "discord.js";
import { ArgumentType, Command } from "..";
import { guildsFile, pages } from "../unusual-whale/unusual-whale";
import { JSONMap } from "../util/file";
export const hiAliasesFile = new JSONMap("JSONs/hi-aliases.json");

let occupied: boolean = false;

export default new Command({
  name: `hi`,
  guildDependentAliases: hiAliasesFile,
  argTypes: [ArgumentType.String],
  async execute(bot: Client, msg: Message, args: Array<string>) {
    if (occupied) {
      return msg.channel.send(
        "Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete."
      );
    }

    occupied = true;

    const waitMsg = await msg.channel.send("Processing...");

    await pages.historicalFlow.goto(
      `https://www.unusualwhales.com/flow/ticker_flows/${args[0]}`
    );

    await new Promise((res) => setTimeout(res, 20000));

    await pages.historicalFlow.screenshot({
      path: "hi.png",
      clip: { x: 468, y: 614, width: 1874, height: 1304 },
    });
    await waitMsg.delete();
    await msg.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(args[0])
          .setImage("attachment://hi.png")
          .setFooter({
            iconURL: guildsFile.find((g) => g.id == msg.guild?.id)?.footerIcon,
            text: guildsFile.find((g) => g.id == msg.guild?.id)?.footer ?? "",
          }),
      ],
      files: ["hi.png"],
    });
    occupied = false;
  },
});

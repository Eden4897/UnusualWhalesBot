import { Client, Message, MessageEmbed } from "discord.js";
import { ArgumentType, Command } from "..";
import { guildsFile, pages } from "../unusual-whale/unusual-whale";
import { JSONMap } from "../util/file";
export const ocAliasesFile = new JSONMap("JSONs/oc-aliases.json");

let occupied: boolean = false;

export default new Command({
  name: `oc`,
  guildDependentAliases: ocAliasesFile,
  argTypes: [ArgumentType.String],
  async execute(bot: Client, msg: Message, args: Array<string>) {
    if (occupied) {
      return msg.channel.send(
        "Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete."
      );
    }

    occupied = true;
    const waitMsg = await msg.channel.send("Processing...");

    await pages.optionsCharting.evaluate(() => {
      (<HTMLInputElement>(
        document.querySelector("input.form-control:nth-child(1)")
      )).select();
    });

    await pages.optionsCharting.type(
      "input.form-control:nth-child(1)",
      args[0]
    );

    await new Promise((res) => setTimeout(res, 1000));

    await pages.optionsCharting.click(".button");

    await new Promise((res) => setTimeout(res, 5000));

    await pages.optionsCharting.screenshot({
      path: "oc.png",
      clip: { x: 250, y: 346, width: 2301, height: 2001 },
    });
    await waitMsg.delete();
    await msg.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(args[0])
          .setImage("attachment://oc.png")
          .setFooter({
            iconURL: guildsFile.find((g) => g.id == msg.guild?.id)?.footerIcon,
            text: guildsFile.find((g) => g.id == msg.guild?.id)?.footer ?? "",
          }),
      ],
      files: ["oc.png"],
    });
    occupied = false;
  },
});

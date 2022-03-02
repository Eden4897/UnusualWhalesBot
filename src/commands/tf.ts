import { Client, Message, MessageEmbed } from "discord.js";
import { extractColors } from "extract-colors";
import { Command } from "..";
import { guildsFile, pages } from "../unusual-whale/unusual-whale";
import { JSONMap } from "../util/file";
export const tfAliasesFile = new JSONMap("JSONs/tf-aliases.json");

let occupied: boolean = false;

export default new Command({
  name: `tf`,
  guildDependentAliases: tfAliasesFile,
  async execute(bot: Client, msg: Message, args: Array<string>) {
    if (occupied) {
      return msg.channel.send(
        "Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete."
      );
    }

    occupied = true;
    const waitMsg = await msg.channel.send("Processing...");

    // Sometimes the screenshot returns blank, basically brute forcing it until it is not empty
    do {
      await pages.tickerFlows.screenshot({
        path: "ticker-flows.png",
        clip: { x: 467, y: 86, width: 1877, height: 2307 },
      });
    } while (
      (
        await extractColors("ticker-flows.png", {
          pixels: 1000000,
        })
      ).length <= 3
    );

    await waitMsg.delete();
    await msg.reply({
      embeds: [
        new MessageEmbed().setImage("attachment://ticker-flows.png").setFooter({
          text: guildsFile.find((g) => g.id == msg.guild?.id)?.footer ?? "",
        }),
      ],
      files: ["ticker-flows.png"],
    });
    occupied = false;
  },
});

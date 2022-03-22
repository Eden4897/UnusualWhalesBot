import { Client, Message, MessageEmbed } from "discord.js";
import { ArgumentType, Command } from "..";
import { guildsFile, pages } from "../unusual-whale/unusual-whale";
import { JSONMap } from "../util/file";
export const ceAliasesFile = new JSONMap("JSONs/ce-aliases.json");

let occupied: boolean = false;

export default new Command({
  name: `ce`,
  guildDependentAliases: ceAliasesFile,
  argTypes: [ArgumentType.String],
  async execute(bot: Client, msg: Message, args: Array<string>) {
    if (occupied) {
      return msg.channel.send(
        "Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete."
      );
    }
    occupied = true;

    const waitMsg = await msg.channel.send("Processing...");
    await pages.chainExplorer.click(
      "#simple-tab-0 > span.MuiTab-wrapper > ion-icon"
    );

    await new Promise((res) => setTimeout(res, 2000));

    await pages.chainExplorer.evaluate(() => {
      (<HTMLInputElement>document.querySelector("#standard-basic")).select();
    });

    await pages.chainExplorer.type("#standard-basic", args[0]);

    await pages.chainExplorer.click(
      "p.MuiTypography-root > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)"
    );

    await new Promise((res) => setTimeout(res, 2000));

    await pages.chainExplorer.screenshot({
      path: "chain-explorer.png",
      clip: {
        x: 491,
        y: 164,
        width: 1827,
        height: 804,
      },
    });
    await waitMsg.delete();
    await msg.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(args[0])
          .setImage("attachment://chain-explorer.png")
          .setFooter({
            iconURL: guildsFile.find((g) => g.id == msg.guild?.id)?.footerIcon,
            text: guildsFile.find((g) => g.id == msg.guild?.id)?.footer ?? "",
          }),
      ],
      files: ["chain-explorer.png"],
    });
    occupied = false;
  },
});

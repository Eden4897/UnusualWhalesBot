import { Client, Message } from "discord.js";
import { ArgumentType, Command } from "..";
import { pages } from "../unusual-whale/unusual-whale";
import { JSONMap } from "../util/file";
const hchAliasesFile = new JSONMap("JSONs/hch-aliases.json");

let occupied: boolean = false;
let currentPage: number = 1;

export default new Command({
  name: `hch`,
  guildDependentAliases: hchAliasesFile,
  args: [ArgumentType.Number],
  async execute(bot: Client, msg: Message, args: Array<string>) {
    if (occupied) {
      return msg.channel.send(
        "Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete."
      );
    }
    occupied = true;
    const toFlip = parseInt(args[0]) - currentPage;
    if (toFlip < 0) {
      for (let i = 0; i < Math.abs(toFlip); i++) {
        await pages.hotChainsNTickersHidden.click(
          'button[aria-label="Previous page"]'
        );
        await new Promise((res) => setTimeout(res, 100));
      }
    }
    if (toFlip > 0) {
      for (let i = 0; i < Math.abs(toFlip); i++) {
        await pages.hotChainsNTickersHidden.click(
          'button[aria-label="Next page"]'
        );
        await new Promise((res) => setTimeout(res, 100));
      }
    }

    currentPage = await pages.hotChainsNTickersHidden.evaluate(() => {
      return (
        (parseInt(
          (
            document.querySelector(
              "p.MuiTypography-root:nth-child(4)"
            ) as HTMLElement
          ).innerText.split("-")[0]
        ) -
          1) /
        50
      );
    });

    await pages.hotChainsNTickersHidden.screenshot({
      path: "hot-chains-and-tickers.png",
      clip: {
        x: 530,
        y: 574,
        width: 1814,
        height: 2700,
      },
    });
    await msg.reply({
      files: ["hot-chains-and-tickers.png"],
    });
    occupied = false;
  },
});

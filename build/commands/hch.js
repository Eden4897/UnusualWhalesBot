"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const unusual_whale_1 = require("../unusual-whale/unusual-whale");
const file_1 = require("../util/file");
const hchAliasesFile = new file_1.JSONMap("JSONs/hch-aliases.json");
let occupied = false;
let currentPage = 1;
exports.default = new __1.Command({
    name: `hch`,
    guildDependentAliases: hchAliasesFile,
    args: [__1.ArgumentType.Number],
    async execute(bot, msg, args) {
        if (occupied) {
            return msg.channel.send("Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete.");
        }
        occupied = true;
        const toFlip = parseInt(args[0]) - currentPage;
        if (toFlip < 0) {
            for (let i = 0; i < Math.abs(toFlip); i++) {
                await unusual_whale_1.pages.hotChainsNTickersHidden.click('button[aria-label="Previous page"]');
                await new Promise((res) => setTimeout(res, 100));
            }
        }
        if (toFlip > 0) {
            for (let i = 0; i < Math.abs(toFlip); i++) {
                await unusual_whale_1.pages.hotChainsNTickersHidden.click('button[aria-label="Next page"]');
                await new Promise((res) => setTimeout(res, 100));
            }
        }
        currentPage = await unusual_whale_1.pages.hotChainsNTickersHidden.evaluate(() => {
            return ((parseInt(document.querySelector("p.MuiTypography-root:nth-child(4)").innerText.split("-")[0]) -
                1) /
                50);
        });
        await unusual_whale_1.pages.hotChainsNTickersHidden.screenshot({
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
//# sourceMappingURL=hch.js.map
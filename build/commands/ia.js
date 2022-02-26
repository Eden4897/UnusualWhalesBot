"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const unusual_whale_1 = require("../unusual-whale/unusual-whale");
const file_1 = require("../util/file");
const iaAliasesFile = new file_1.JSONMap("JSONs/ia-aliases.json");
let occupied = false;
exports.default = new __1.Command({
    name: `ia`,
    guildDependentAliases: iaAliasesFile,
    args: [__1.ArgumentType.String],
    async execute(bot, msg, args) {
        if (occupied) {
            return msg.channel.send("Sorry, this command is currently occupied. Please try again a few seconds later after the previous request is complete.");
        }
        occupied = true;
        await unusual_whale_1.pages.intradayAnalyst.goto(`https://www.unusualwhales.com/flow/ticker/overview?symbol=${args[0]}`);
        await new Promise((r) => setTimeout(r, 10000));
        await unusual_whale_1.pages.intradayAnalyst.screenshot({
            path: "intraday-analyst.png",
            clip: { width: 1890, height: 1080, x: 460, y: 744 },
        });
        await msg.reply({
            files: ["intraday-analyst.png"],
        });
        occupied = false;
    },
});
//# sourceMappingURL=ia.js.map
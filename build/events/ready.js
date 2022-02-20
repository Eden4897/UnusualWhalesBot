"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unusual_whale_1 = require("../unusual-whale/unusual-whale");
exports.default = async (bot) => {
    console.log(`${bot.user.username} is online!`);
    (0, unusual_whale_1.startScraper)();
};
//# sourceMappingURL=ready.js.map
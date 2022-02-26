"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unusual_whale_1 = require("../unusual-whale/unusual-whale");
exports.default = async (bot, guild) => {
    unusual_whale_1.guildsFile.remove((e) => e.id == guild.id);
};
//# sourceMappingURL=guildDelete.js.map
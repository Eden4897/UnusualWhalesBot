"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.banListFile = void 0;
const unusual_whale_1 = require("../unusual-whale/unusual-whale");
const config_json_1 = require("../config.json");
const file_1 = require("../util/file");
exports.banListFile = new file_1.JSONArray("JSONs/ban-list.json");
exports.default = async (bot, guild) => {
    if (exports.banListFile.find((b) => b.id == guild.id))
        return guild.leave();
    unusual_whale_1.guildsFile.push({
        id: guild.id,
        enabled: false,
    });
    const masterOwner = await bot.users.fetch(config_json_1.MASTER);
    masterOwner.send(`I have just been added into the "${guild.name}". If this was unintended, please remove me through the through the \`servers\` comand. If this was intended, please enable this server also through the \`servers\` comand.`);
};
//# sourceMappingURL=guildCreate.js.map
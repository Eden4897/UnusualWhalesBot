"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = exports.Command = exports.testArgument = exports.CommandType = exports.ArgumentType = exports.config = exports.bot = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const global_1 = require("./util/global");
exports.config = global_1.default;
exports.bot = new discord_js_1.Client({
    intents: 49151,
    partials: ["CHANNEL"],
}); //use 48893 if no privileged intents (GUILD_PRESENCES and GUILD_MEMBERS)
var ArgumentType;
(function (ArgumentType) {
    ArgumentType[ArgumentType["Number"] = 0] = "Number";
    ArgumentType[ArgumentType["PositiveNumber"] = 1] = "PositiveNumber";
    ArgumentType[ArgumentType["NonZeroPositiveNumber"] = 2] = "NonZeroPositiveNumber";
    ArgumentType[ArgumentType["Integer"] = 3] = "Integer";
    ArgumentType[ArgumentType["PositiveInteger"] = 4] = "PositiveInteger";
    ArgumentType[ArgumentType["NonZeroPositiveInteger"] = 5] = "NonZeroPositiveInteger";
    ArgumentType[ArgumentType["Alphanumeric"] = 6] = "Alphanumeric";
    ArgumentType[ArgumentType["Alphabetic"] = 7] = "Alphabetic";
    ArgumentType[ArgumentType["Lowercase"] = 8] = "Lowercase";
    ArgumentType[ArgumentType["Uppercase"] = 9] = "Uppercase";
    ArgumentType[ArgumentType["String"] = 10] = "String";
    ArgumentType[ArgumentType["MemberMention"] = 11] = "MemberMention";
    ArgumentType[ArgumentType["ChannelMention"] = 12] = "ChannelMention";
    ArgumentType[ArgumentType["RoleMention"] = 13] = "RoleMention";
    ArgumentType[ArgumentType["ID"] = 14] = "ID";
})(ArgumentType = exports.ArgumentType || (exports.ArgumentType = {}));
var CommandType;
(function (CommandType) {
    CommandType[CommandType["All"] = 0] = "All";
    CommandType[CommandType["DM"] = 1] = "DM";
    CommandType[CommandType["Guild"] = 2] = "Guild";
})(CommandType = exports.CommandType || (exports.CommandType = {}));
function testArgument(argType, value) {
    switch (argType) {
        case ArgumentType.Number:
            return isNaN(+value);
        case ArgumentType.PositiveNumber:
            return isNaN(+value) && +value >= 0;
        case ArgumentType.NonZeroPositiveNumber:
            return isNaN(+value) && +value > 0;
        case ArgumentType.Integer:
            return isNaN(+value) && !value.includes(`.`);
        case ArgumentType.PositiveInteger:
            return isNaN(+value) && !value.includes(`.`) && +value >= 0;
        case ArgumentType.NonZeroPositiveInteger:
            return isNaN(+value) && !value.includes(`.`) && +value > 0;
        case ArgumentType.Alphanumeric:
            return !/[^\w ]/.test(value);
        case ArgumentType.Alphabetic:
            return !/[^a-zA-Z]/.test(value);
        case ArgumentType.Lowercase:
            return !/[^a-z]/.test(value);
        case ArgumentType.Uppercase:
            return !/[^A-Z]/.test(value);
        case ArgumentType.String:
            return true;
        case ArgumentType.MemberMention:
            return (value.slice(0, 2) == "<@" &&
                value[20] == ">" &&
                !isNaN(+value.slice(2, 20)));
        case ArgumentType.ChannelMention:
            return (value.slice(0, 2) == "<#" &&
                value[20] == ">" &&
                !isNaN(+value.slice(2, 20)));
        case ArgumentType.RoleMention:
            return (value.slice(0, 3) == "<@&" &&
                value[21] == ">" &&
                !isNaN(+value.slice(3, 21)));
        case ArgumentType.ID:
            return value.length == 18 && !isNaN(+value);
    }
}
exports.testArgument = testArgument;
class Command {
    constructor(opt) {
        this.permissionTest = () => true;
        this.type = CommandType.All;
        this.cd = 0;
        this.aliases = [];
        this.args = [];
        Object.assign(this, opt);
    }
}
exports.Command = Command;
exports.commands = new discord_js_1.Collection();
(0, fs_1.readdir)(`${__dirname}\\commands`, (err, files) => {
    if (err)
        return console.error;
    files.forEach((file) => {
        if (!file.endsWith(`.js`))
            return;
        const command = require(`${__dirname}\\commands\\${file}`).default;
        exports.commands.set(command.name, command);
    });
});
(0, fs_1.readdir)(`${__dirname}\\events/`, (err, files) => {
    if (err)
        return console.error;
    files.forEach((file) => {
        if (!file.endsWith(`.js`))
            return;
        const event = require(`${__dirname}\\events\\${file}`).default;
        const eventName = file.split(`.`)[0];
        exports.bot.on(eventName, event.bind(null, exports.bot));
    });
});
exports.bot.login(global_1.default.TOKEN);
process.on("uncaughtException", function (err) {
    console.error("Caught exception: " + err);
});
//# sourceMappingURL=index.js.map
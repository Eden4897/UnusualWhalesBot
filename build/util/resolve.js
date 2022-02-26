"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRole = exports.resolveChannel = exports.resolveUser = exports.resolveMember = void 0;
const __1 = require("..");
function resolveMember(value, guild) {
    var _a;
    if (value.slice(0, 2) == "<@" &&
        value[20] == ">" &&
        !isNaN(+value.slice(2, 20))) {
        value = value.slice(2, 20);
    }
    return ((_a = guild.members.cache.get(value)) !== null && _a !== void 0 ? _a : guild.members.cache.find((member) => member.user.username == value || member.nickname == value));
}
exports.resolveMember = resolveMember;
function resolveUser(value) {
    var _a;
    if (value.slice(0, 2) == "<@" &&
        value[20] == ">" &&
        !isNaN(+value.slice(2, 20))) {
        value = value.slice(2, 20);
    }
    return ((_a = __1.bot.users.cache.get(value)) !== null && _a !== void 0 ? _a : __1.bot.users.cache.find((user) => user.username == value));
}
exports.resolveUser = resolveUser;
function resolveChannel(value, guild) {
    var _a;
    if (value.slice(0, 2) == "<#" &&
        value[20] == ">" &&
        !isNaN(+value.slice(2, 20))) {
        value = value.slice(2, 20);
    }
    return ((_a = guild.channels.cache.get(value)) !== null && _a !== void 0 ? _a : guild.channels.cache.find((Channel) => Channel.name == value));
}
exports.resolveChannel = resolveChannel;
function resolveRole(value, guild) {
    var _a;
    if (value.slice(0, 3) == "<@&" &&
        value[21] == ">" &&
        !isNaN(+value.slice(3, 21))) {
        value = value.slice(3, 21);
    }
    return ((_a = guild.roles.cache.get(value)) !== null && _a !== void 0 ? _a : guild.roles.cache.find((Channel) => Channel.name == value));
}
exports.resolveRole = resolveRole;
//# sourceMappingURL=resolve.js.map
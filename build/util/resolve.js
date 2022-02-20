"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRole = exports.resolveChannel = exports.resolveUser = exports.resolveMember = void 0;
const __1 = require("..");
function resolveMember(value, guild) {
    if (value.slice(0, 2) == '<@' &&
        value[20] == '>' &&
        !isNaN(+value.slice(2, 20))) {
        value = value.slice(2, 20);
    }
    return (guild.members.cache.get(value) ||
        guild.members.cache.find((member) => member.user.username == value || member.nickname == value));
}
exports.resolveMember = resolveMember;
function resolveUser(value) {
    if (value.slice(0, 2) == '<@' &&
        value[20] == '>' &&
        !isNaN(+value.slice(2, 20))) {
        value = value.slice(2, 20);
    }
    return (__1.bot.users.cache.get(value) ||
        __1.bot.users.cache.find((user) => user.username == value));
}
exports.resolveUser = resolveUser;
function resolveChannel(value, guild) {
    if (value.slice(0, 2) == '<#' &&
        value[20] == '>' &&
        !isNaN(+value.slice(2, 20))) {
        value = value.slice(2, 20);
    }
    return (guild.channels.cache.get(value) ||
        guild.channels.cache.find((Channel) => Channel.name == value));
}
exports.resolveChannel = resolveChannel;
function resolveRole(value, guild) {
    if (value.slice(0, 3) == '<@&' &&
        value[21] == '>' &&
        !isNaN(+value.slice(3, 21))) {
        value = value.slice(3, 21);
    }
    return (guild.roles.cache.get(value) ||
        guild.roles.cache.find((Channel) => Channel.name == value));
}
exports.resolveRole = resolveRole;
//# sourceMappingURL=resolve.js.map
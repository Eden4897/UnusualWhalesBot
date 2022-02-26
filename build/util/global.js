"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let config;
try {
    config = require("../config.json");
}
catch (_a) {
    config = process.env;
}
exports.default = {
    PREFIX: config.PREFIX,
    TOKEN: config.TOKEN,
};
//# sourceMappingURL=global.js.map
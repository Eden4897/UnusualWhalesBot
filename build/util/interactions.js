"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachCallbackButtons = exports.CallbackButton = exports.ButtonApperance = void 0;
const discord_js_1 = require("discord.js");
class ButtonApperance {
    constructor() {
        this.disabled = false;
        this.emoji = null;
        this.label = "";
        this.style = "PRIMARY";
        this.url = "";
    }
}
exports.ButtonApperance = ButtonApperance;
class CallbackButton extends ButtonApperance {
    constructor() {
        super(...arguments);
        this.authorOnly = true;
        this.collectorDuraction = 30000;
    }
}
exports.CallbackButton = CallbackButton;
async function attachCallbackButtons(originalMsg, botMsg, callbackButtons) {
    var _a, _b, _c, _d;
    //'\n' =  start new line of buttons
    const buttonRows = [new discord_js_1.MessageActionRow()];
    for (const [i, callbackButton] of callbackButtons.entries()) {
        if (callbackButton == "\n") {
            buttonRows.push(new discord_js_1.MessageActionRow());
            continue;
        }
        const button = new discord_js_1.MessageButton()
            .setCustomId(`${botMsg.id}-callbackButton-${i}`)
            .setDisabled((_a = callbackButton.disabled) !== null && _a !== void 0 ? _a : false)
            .setEmoji(callbackButton.emoji)
            .setLabel((_b = callbackButton.label) !== null && _b !== void 0 ? _b : "")
            .setStyle((_c = callbackButton.style) !== null && _c !== void 0 ? _c : "PRIMARY")
            .setURL((_d = callbackButton.url) !== null && _d !== void 0 ? _d : "");
        if (buttonRows[buttonRows.length - 1].components.length >= 5) {
            if (buttonRows.length >= 5) {
                throw new Error("Too many buttons.");
            }
            buttonRows.push(new discord_js_1.MessageActionRow());
        }
        buttonRows[buttonRows.length - 1].addComponents(button);
    }
    await botMsg.edit({
        components: buttonRows,
    });
    for (const [i, callbackButton] of (callbackButtons).entries()) {
        const filter = (interaction) => interaction.customId === `${botMsg.id}-callbackButton-${i}`.toString() &&
            (callbackButton.authorOnly
                ? interaction.user.id === botMsg.author.id
                : true);
        const collector = botMsg.createMessageComponentCollector({
            filter,
            time: callbackButton.collectorDuraction,
        });
        collector.on("collect", async (interaction) => {
            interaction.deferUpdate();
            await callbackButton.callback(originalMsg ? originalMsg : null, botMsg, updateButtonApperance);
        });
    }
    async function updateButtonApperance(buttonIndex, newButton) {
        var _a, _b, _c, _d;
        const row = Math.floor(buttonIndex / 5);
        const column = buttonIndex % 5;
        const newRow = buttonRows[row].components;
        const button = new discord_js_1.MessageButton()
            .setCustomId(`${botMsg.id}-callbackButton-${buttonIndex}`)
            .setDisabled((_a = newButton.disabled) !== null && _a !== void 0 ? _a : false)
            .setEmoji(newButton.emoji)
            .setLabel((_b = newButton.label) !== null && _b !== void 0 ? _b : "")
            .setStyle((_c = newButton.style) !== null && _c !== void 0 ? _c : "PRIMARY")
            .setURL((_d = newButton.url) !== null && _d !== void 0 ? _d : "");
        newRow[column] = button;
        buttonRows[row].setComponents(newRow);
        await botMsg.edit({
            components: buttonRows,
        });
    }
}
exports.attachCallbackButtons = attachCallbackButtons;
//# sourceMappingURL=interactions.js.map
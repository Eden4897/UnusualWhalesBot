"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectableBook = void 0;
const discord_js_1 = require("discord.js");
const book_1 = require("./book");
class SelectableBook extends book_1.Book {
    constructor(pageEntriesGenerator, activator = null, title = "", maxiumPageSize = 25, selectionButtons = []) {
        super({ pageEntriesGenerator, activator, title, maxiumPageSize });
        this.cursorIndex = 0;
        this.maximumPageSize = 25;
        this.createEmbed = () => {
            this.updatePages(pageEntriesGenerator());
            if (this.pages.length >= 1) {
                if (this.pages.length <= this.currentPageIndex) {
                    this.currentPageIndex = this.pages.length - 1;
                }
            }
            const _ = new discord_js_1.MessageEmbed().setTitle(this.title).addFields(this.pages[this.currentPageIndex].map(({ name, description }, index) => {
                return {
                    name: this.cursorIndex == index ? `> ${name}` : name,
                    value: this.cursorIndex == index
                        ? description
                            .split("\n")
                            .map((line) => "> " + line)
                            .join("\n")
                        : description,
                };
            }));
            if (this.pages.length >= 1)
                _.setFooter({
                    text: `Page ${this.currentPageIndex + 1}/${this.pages.length} Entry ${this.currentPageIndex * this.maximumPageSize + this.cursorIndex + 1}/${this.pages.flat().length}`,
                });
            return _;
        };
        const selectionButtonObjects = selectionButtons.map((selectionButton) => {
            return selectionButton == "\n"
                ? "\n"
                : Object.assign({ callback: async (_, __) => await selectionButton.onSelect(this.pages[this.currentPageIndex][this.cursorIndex].rawEntryData) }, selectionButton.buttonAppearance);
        });
        const prevPageButton = {
            emoji: "◀",
            callback: (_, bookMsg) => {
                if (this.currentPageIndex == 0)
                    this.currentPageIndex = this.pages.length - 1;
                else
                    this.currentPageIndex--;
                this.cursorIndex = 0;
                bookMsg.edit({ embeds: [this.createEmbed()] });
            },
        };
        const nextPageButton = {
            emoji: "▶",
            callback: (_, bookMsg) => {
                if (this.currentPageIndex >= this.pages.length - 1)
                    this.currentPageIndex = 0;
                else
                    this.currentPageIndex++;
                this.cursorIndex = 0;
                bookMsg.edit({ embeds: [this.createEmbed()] });
            },
        };
        const upBotton = {
            emoji: "🔼",
            callback: (_, bookMsg) => {
                if (this.cursorIndex == 0)
                    this.cursorIndex = this.pages[this.currentPageIndex].length - 1;
                else
                    this.cursorIndex--;
                bookMsg.edit({ embeds: [this.createEmbed()] });
            },
        };
        const downButton = {
            emoji: "🔽",
            callback: (_, bookMsg) => {
                if (this.cursorIndex >= this.pages[this.currentPageIndex].length - 1)
                    this.cursorIndex = 0;
                else
                    this.cursorIndex++;
                bookMsg.edit({ embeds: [this.createEmbed()] });
            },
        };
        const selfUpdatingSelectionButtons = selectionButtonObjects.map((e) => {
            // Make all selectionButtons inputted edit the message after the callback
            return e == "\n"
                ? "\n"
                : Object.assign(Object.assign({}, e), { callback: async (_, botMsg) => {
                        await e.callback(_, botMsg);
                        await botMsg.edit({ embeds: [this.createEmbed()] });
                    } });
        });
        this.buttons = [
            prevPageButton,
            nextPageButton,
            upBotton,
            downButton,
            ...selfUpdatingSelectionButtons,
        ];
        this.maximumPageSize = maxiumPageSize;
    }
    updatePages(newPages) {
        this.pages = [[]];
        for (const pageEntry of newPages) {
            if (this.pages[this.pages.length - 1].length >= this.maximumPageSize) {
                this.pages.push([]);
            }
            this.pages[this.pages.length - 1].push(pageEntry);
        }
    }
}
exports.SelectableBook = SelectableBook;
//# sourceMappingURL=selectableBook.js.map
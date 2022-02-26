"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const discord_js_1 = require("discord.js");
const interactions_1 = require("./interactions");
class Book {
    constructor({ pageEntriesGenerator, activator, title = "", maxiumPageSize = 25, }) {
        this.pages = [[]];
        this.title = "";
        this.activator = null;
        this.currentPageIndex = 0;
        this.createEmbed = () => {
            const _ = new discord_js_1.MessageEmbed()
                .setTitle(this.title)
                .addFields(this.pages[this.currentPageIndex].map(({ name, description }) => {
                return { name, value: description };
            }))
                .setFooter({
                text: `Page ${this.currentPageIndex + 1}/${this.pages.length}`,
            });
            return _;
        };
        this.buttons = [
            {
                emoji: "◀",
                callback: (_, bookMsg) => {
                    if (this.currentPageIndex == 0)
                        this.currentPageIndex = this.pages.length - 1;
                    else
                        this.currentPageIndex--;
                    const embed = this.createEmbed();
                    bookMsg.edit({ embeds: [embed] });
                },
            },
            {
                emoji: "▶",
                callback: (_, bookMsg) => {
                    if (this.currentPageIndex >= this.pages.length - 1)
                        this.currentPageIndex = 0;
                    else
                        this.currentPageIndex++;
                    const embed = this.createEmbed();
                    bookMsg.edit({ embeds: [embed] });
                },
            },
        ];
        for (const pageEntry of pageEntriesGenerator()) {
            if (this.pages[this.pages.length - 1].length >= maxiumPageSize) {
                this.pages.push([]);
            }
            this.pages[this.pages.length - 1].push(pageEntry);
        }
        this.title = title;
        this.activator = activator;
    }
    async send(channel) {
        this.createEmbed();
        const bookMsg = await channel.send({ embeds: [this.createEmbed()] });
        (0, interactions_1.attachCallbackButtons)(this.activator, bookMsg, this.buttons);
    }
}
exports.Book = Book;
//# sourceMappingURL=book.js.map
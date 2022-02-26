"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageFlipper = void 0;
const discord_js_1 = require("discord.js");
const interactions_1 = require("./interactions");
class PageFlipper {
    constructor(pageEntries, user = null, title = '', maxiumPageSize = 25) {
        this.pages = [[]];
        this.title = '';
        this.user = null;
        for (const pageEntry of pageEntries) {
            if (this.pages[this.pages.length - 1].length >= maxiumPageSize) {
                this.pages.push([]);
            }
            this.pages[this.pages.length - 1].push(pageEntry);
        }
        this.title = title;
        this.user = user;
    }
    async send(channel) {
        let currentPageIndex = 0;
        let cursorIndex = 0;
        const createEmbed = () => {
            const _ = new discord_js_1.MessageEmbed().setTitle(this.title)
                .addFields(this.pages[currentPageIndex].map((({ name, description }, index) => {
                return { name: cursorIndex == index ? `> ${name}` : name, value: cursorIndex == index ? description.split('\n').map(line => '> ' + line).join('\n') : description };
            })));
            if (this.pages.length >= 1)
                _.setFooter({ text: `Page ${currentPageIndex + 1}/${this.pages.length}` });
            return _;
        };
        const page1Embed = createEmbed();
        const bookMsg = await channel.send({ embeds: [page1Embed] });
        if (this.pages.length === 1)
            return;
        (0, interactions_1.attachButtons)(null, bookMsg, [{
                emoji: '◀',
                callback: () => {
                    if (currentPageIndex == 0)
                        currentPageIndex = this.pages.length - 1;
                    else
                        currentPageIndex--;
                    cursorIndex = 0;
                    const embed = createEmbed();
                    bookMsg.edit({ embeds: [embed] });
                }
            }, {
                emoji: '▶',
                callback: () => {
                    if (currentPageIndex >= this.pages.length - 1)
                        currentPageIndex = 0;
                    else
                        currentPageIndex++;
                    cursorIndex = 0;
                    const embed = createEmbed();
                    bookMsg.edit({ embeds: [embed] });
                }
            }, {
                emoji: '🔼',
                callback: () => {
                    if (cursorIndex == 0)
                        cursorIndex = this.pages[currentPageIndex].length - 1;
                    else
                        cursorIndex--;
                    const embed = createEmbed();
                    bookMsg.edit({ embeds: [embed] });
                }
            }, {
                emoji: '🔽',
                callback: () => {
                    if (cursorIndex >= this.pages[currentPageIndex].length - 1)
                        cursorIndex = 0;
                    else
                        cursorIndex++;
                    const embed = createEmbed();
                    bookMsg.edit({ embeds: [embed] });
                }
            }]);
    }
}
exports.PageFlipper = PageFlipper;
//# sourceMappingURL=pageFlipper.js.map
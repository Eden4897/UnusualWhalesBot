import { Client } from "discord.js";
import { scraperRestartLoop } from "../unusual-whale/unusual-whale";

export default async (bot: Client) => {
  console.log(`${bot.user.username} is online!`);

  scraperRestartLoop();
};

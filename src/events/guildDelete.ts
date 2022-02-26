import { Client, Guild } from "discord.js";
import { guildsFile } from "../unusual-whale/unusual-whale";

export default async (bot: Client, guild: Guild) => {
  guildsFile.remove((e) => e.id == guild.id);
};

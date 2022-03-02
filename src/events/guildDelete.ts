import { Client, Guild } from "discord.js";
import { commands } from "..";
import { guildsFile } from "../unusual-whale/unusual-whale";

export default async (bot: Client, guild: Guild) => {
  guildsFile.remove((e) => e.id == guild.id);
  commands.forEach((cmd) => {
    if (cmd.guildDependentAliases?.get(guild.id))
      cmd.guildDependentAliases.unset(guild.id);
  });
};

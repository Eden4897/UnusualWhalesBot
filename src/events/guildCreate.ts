import { Client, Guild } from "discord.js";
import { guildsFile } from "../unusual-whale/unusual-whale";
import { MASTER } from "../config.json";
import { JSONArray } from "../util/file";

export const banListFile = new JSONArray<{
  id: string;
  serverName: string;
  owner: string;
}>("JSONs/ban-list.json");

export default async (bot: Client, guild: Guild) => {
  if (banListFile.find((b) => b.id == guild.id)) return guild.leave();

  guildsFile.push({
    id: guild.id,
    enabled: false,
  });

  const masterOwner = await bot.users.fetch(MASTER);
  masterOwner.send(
    `I have just been added into the "${guild.name}". If this was unintended, please remove me through the through the \`servers\` comand. If this was intended, please enable this server also through the \`servers\` comand.`
  );
};

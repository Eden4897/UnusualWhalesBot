import { Client, Message } from "discord.js";
import {
  ArgumentType,
  Command,
  commands,
  testArgument,
  config,
  CommandType,
} from "..";
import { guildsFile } from "../unusual-whale/unusual-whale";

let recentCommands: Array<string> = [];

export default async (bot: Client, msg: Message) => {
  if (msg.author.bot) return;

  let args: Array<string> = msg.content
    .substring(config.PREFIX.length)
    .match(/\\?.|^$/g)
    .reduce(
      (p: any, c) => {
        if (c === '"') {
          p.quote ^= 1;
        } else if (!p.quote && c === " ") {
          p.a.push("");
        } else {
          p.a[p.a.length - 1] += c.replace(/\\(.)/, "$1");
        }
        return p;
      },
      { a: [""] }
    ).a;

  let content: string = msg.content.substring(0);

  if (content.substring(0, config.PREFIX.length) == config.PREFIX) {
    let command: Command;
    if (
      commands.some(
        (cmd) =>
          cmd.guildDependentAliases?.get(
            msg.guild?.id ??
              guildsFile.find((g) => g.owner == msg.author.id)?.id
          ) == args[0]
      )
    ) {
      command = commands.find(
        (cmd) =>
          cmd.guildDependentAliases?.get(
            msg.guild?.id ??
              guildsFile.find((g) => g.owner == msg.author.id)?.id
          ) == args[0]
      );
    } else {
      command =
        commands.get(args[0]) ??
        commands.find((cmd) => cmd.aliases.includes(args[0]));
    }
    if (command) {
      try {
        if (command.type == CommandType.DM && msg.guild) {
          return msg.channel.send("This command can only be used in DMs!");
        }
        if (command.type == CommandType.Guild && !msg.guild) {
          return msg.channel.send("This command can only be used in a guild!");
        }
        if (recentCommands.includes(`${msg.author.id}-${args[0]}`)) {
          return msg.channel.send(
            "Please wait a while before using this command again."
          );
        }
        if (!command.permissionTest(msg.member ?? msg.author)) {
          return msg.channel.send(`Access denied.`);
        }

        if (
          command.args.splice(1).some((argTypes, index) => {
            if (!Array.isArray(argTypes)) {
              argTypes = [argTypes as unknown as ArgumentType];
            }
            return (argTypes as Array<ArgumentType>).some((argType) =>
              testArgument(argType, args[index])
            );
          })
        ) {
          return msg.channel.send(
            "Wrong command format; please use the help command."
          );
        }
        recentCommands.push(`${msg.author.id}-${args[0]}`);

        setTimeout(() => {
          recentCommands = recentCommands.filter(
            (r) => r != `${msg.author.id}-${args[0]}`
          );
        }, command.cd);

        await command.execute(bot, msg, args.slice(1), () => {
          recentCommands = recentCommands.filter(
            (r) => r != `${msg.author.id}-${args[0]}`
          );
        });
      } catch (err) {
        console.error(err);
        msg.channel
          .send(
            `There was an error trying to execute the ${args[0]} command! Please contact the admins.`
          )
          .catch(() => {});
      }
    }
  }
};

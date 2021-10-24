import {
  ApplicationCommand,
  ApplicationCommandData,
  GuildResolvable,
} from 'discord.js';
import DiscordBot from '../../DiscordBot';
import Settings from '../../Settings';
import Command from '../Command';
import CommandPermissions from '../CommandPermissions';
import UserColorCommand from '../UserColorCommand';
import DeployCommand from '../DeployCommand';

export type ApplicationCommandType = ApplicationCommand<{
  guild: GuildResolvable;
}>;

export default class CommandHandler {
  static _commands: Command[] = [new DeployCommand()];

  public static addCommands(): void {
    const userColorCommand: Command | undefined = CommandHandler._commands.find(
      (command: Command): boolean => command instanceof UserColorCommand
    );
    if (Settings.getSettings()['user-color'] && !userColorCommand)
      CommandHandler._commands.push(new UserColorCommand());
    if (!Settings.getSettings()['user-color'] && userColorCommand)
      CommandHandler._commands.filter(
        (command: Command): boolean =>
          command.deploy.name !== userColorCommand.deploy.name
      );

    const guildCommands: ApplicationCommandData[] = CommandHandler._commands
      .filter((command: Command): boolean => command.guildOnly)
      .map((command: Command): ApplicationCommandData => command.deploy);
    const dmCommands: ApplicationCommandData[] = CommandHandler._commands
      .filter((command: Command): boolean => !command.guildOnly)
      .map((command: Command): ApplicationCommandData => command.deploy);

    DiscordBot._client.application!.commands.set(dmCommands);
    for (const guild of DiscordBot._client.guilds.cache.toJSON()) {
      guild.commands
        .fetch()
        .then((): void => {
          const commandPermissions: CommandPermissions = new CommandPermissions(
            guild
          );

          guild.commands
            .set(guildCommands)
            .then(commandPermissions.onCommandSet.bind(commandPermissions))
            .catch(console.error);
        })
        .catch(console.error);
    }
  }
}

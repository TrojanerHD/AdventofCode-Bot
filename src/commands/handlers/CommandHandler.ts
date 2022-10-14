import {
  ApplicationCommand,
  ApplicationCommandData,
  GuildResolvable,
} from 'discord.js';
import DiscordBot from '../../DiscordBot';
import Settings from '../../Settings';
import Command from '../Command';
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

    const commands: ApplicationCommandData[] = CommandHandler._commands
      .map((command: Command): ApplicationCommandData => command.deploy);

    DiscordBot._client.application!.commands.set(commands);
  }
}

import {
  ApplicationCommandData,
  Collection,
  CommandInteractionOption,
  Interaction,
  PermissionFlagsBits,
  Snowflake,
} from 'discord.js';
import DiscordBot from '../DiscordBot';
import Command, { Reply } from './Command';
import CommandHandler, {
  ApplicationCommandType,
} from './handlers/CommandHandler';

export default class DeployCommand implements Command {
  deploy: ApplicationCommandData = {
    name: 'deploy',
    description: 'Deploys the custom commands',
    options: [
      {
        type: 1,
        name: 'all',
        description: 'Deploys the custom commands',
        options: [],
      },
      {
        type: 1,
        name: 'remove',
        description: 'Removes the deployed commands',
        options: [],
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    dmPermission: false,
  };

  handleCommand(args: readonly CommandInteractionOption[]): Reply {
    switch (args[0].name) {
      case 'all':
        CommandHandler.addCommands();
        return { reply: 'All commands have been added', ephemeral: true };
      case 'remove':
        DiscordBot._client
          .application!.commands.fetch()
          .then(this.commandsFetched)
          .catch(console.error);

        for (const guild of DiscordBot._client.guilds.cache.toJSON())
          guild.commands
            .fetch()
            .then(this.commandsFetched)
            .catch(console.error);
        return { reply: 'All commands have been removed', ephemeral: true };
      default:
        return { reply: 'Something went wrong', ephemeral: true };
    }
  }

  private commandsFetched(
    commands: Collection<Snowflake, ApplicationCommandType>
  ) {
    for (const command of commands.toJSON())
      command.delete().catch(console.error);
  }
}

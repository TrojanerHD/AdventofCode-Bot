import { Interaction } from 'discord.js';
import DiscordBot from '../../DiscordBot';
import Command, { Reply } from '../Command';
import CommandHandler from './CommandHandler';

export default class ReactionHandler {
  constructor() {
    DiscordBot._client.on('interactionCreate', this.onReaction.bind(this));
  }

  private onReaction(interaction: Interaction): void {
    if (!interaction.isCommand()) return;
    const command: Command | undefined = CommandHandler._commands.find(
      (findCommand: Command): boolean =>
        findCommand.deploy.name === interaction.commandName
    );
    if (!command) return;
    const reply: Reply = command.handleCommand(
      interaction.options.data,
      interaction
    );
    if (!reply.ephemeral) reply.ephemeral = false;
    if (!reply.afterResponse) reply.afterResponse = (): void => {};
    interaction
      .reply({ content: reply.reply, ephemeral: reply.ephemeral })
      .then(reply.afterResponse.bind(this))
      .catch(console.error);
  }
}

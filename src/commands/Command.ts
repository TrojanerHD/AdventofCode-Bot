import {
  ApplicationCommandData,
  CommandInteractionOption,
  Interaction,
} from 'discord.js';

export interface Reply {
  reply?: string;
  ephemeral?: boolean;
  afterResponse?: () => void;
}

export default abstract class Command {
  abstract deploy: ApplicationCommandData;
  abstract handleCommand(
    args: readonly CommandInteractionOption[],
    interaction: Interaction
  ): Reply;
}

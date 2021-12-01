import {
  ApplicationCommandData,
  CommandInteractionOption,
  Interaction,
} from 'discord.js';

export interface Reply {
  reply?: string | null;
  ephemeral?: boolean;
  afterResponse?: () => void;
}

export default abstract class Command {
  abstract deploy: ApplicationCommandData;
  guildOnly: boolean = false;
  abstract handleCommand(
    args: readonly CommandInteractionOption[],
    interaction: Interaction
  ): Reply;
}

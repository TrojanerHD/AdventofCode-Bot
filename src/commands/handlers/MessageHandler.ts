import { Message, Role } from 'discord.js';
import DiscordBot from '../../DiscordBot';
import Settings from '../../Settings';
import CommandHandler from './CommandHandler';

export default class MessageHandler {
  constructor() {
    DiscordBot._client.on('messageCreate', this.onMessage.bind(this));
  }
  private onMessage(message: Message): void {
    if (
      message.channel.type === 'DM' ||
      message.author.bot ||
      message.content !== '!deploy'
    )
      return;
    if (
      !message.member!.roles.cache.find((role: Role): boolean =>
        Settings.getSettings()['permission-roles'].includes(role.name)
      )
    ) {
      message
        .reply({
          content: 'You do not have the permission to perform this command',
          allowedMentions: { repliedUser: false },
        })
        .catch(console.error);
      return;
    }
    CommandHandler.addCommands();
    message
      .reply({
        content: 'Commands deployed',
        allowedMentions: { repliedUser: false },
      })
      .catch(console.error);
  }
}

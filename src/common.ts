import {
  MessageEmbed,
  TextBasedChannels,
  MessageOptions,
  Message,
} from 'discord.js';

export function parseDay(date: Date, day?: number): string {
  if (!day) day = date.getDate();
  return date.getDate() < 10 ? `0${day}` : day.toString();
}

export function send(
  channel: TextBasedChannels | undefined,
  message: MessageEmbed | MessageOptions,
  callback?: (message: Message) => void
): void {
  if (!channel) return;
  let messageOptions: MessageOptions = {};
  if (message instanceof MessageEmbed) messageOptions.embeds = [message];
  else messageOptions = message;
  const msg: Promise<Message> = channel.send(messageOptions);

  if (callback) msg.then(callback);
  msg.catch(console.error);
}

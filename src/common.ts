import {
  MessageEmbed,
  TextBasedChannels,
  MessageOptions,
  Message,
} from 'discord.js';

export function parseDay(date: Date, day?: number): string {
  if (!day) day = date.getDate();
  return day < 10 ? `0${day}` : day.toString();
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

/**
 * Checks if given date is in the Advent of Code time (between Dec 1 and Dec 25)
 * @param date The date to check
 * @returns Whether the date is in the Advent of Code time
 */
export function aocTime(date: Date): boolean {
  return date.getMonth() === 11 && date.getDate() <= 25;
}

import {
  EmbedBuilder,
  Message,
  MessageCreateOptions,
  TextChannel,
} from 'discord.js';

export function parseDay(date: Date, day?: number): string {
  if (!day) day = date.getDate();
  return day < 10 ? `0${day}` : day.toString();
}

export function send(
  channel: TextChannel | undefined,
  message: EmbedBuilder | MessageCreateOptions,
  callback?: (message: Message) => void
): void {
  if (!channel) return;
  let messageOptions: MessageCreateOptions = {};
  if ('data' in message) messageOptions.embeds = [message];
  else messageOptions = message;
  const msg: Promise<Message> = channel.send(messageOptions);

  if (callback) msg.then(callback);
  msg.catch(console.error);
}

/**
 * Checks if given date is in the Advent of Code time
 * (between Dec 1 and Dec 25 for 2024 or earlier and between Dec 1 and Dec 12 for 2025 or later)
 * @param date The date to check
 * @returns Whether the date is in the Advent of Code time
 */
export function aocTime(date: Date): boolean {
  return (
    date.getMonth() === 11 &&
    date.getDate() <= numberOfDays(date.getFullYear())&&
    (date.getDate() !== 1 || date.getUTCHours() >= 5)
  );
}

/**
 * Returns the number of days of challenges for the current year
 * @param year The year to check
 * @returns The amount of days for the specified year
 */
export function numberOfDays(year: number): number {
  return year <= 2024 ? 25 : 12;
}

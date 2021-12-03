import {
  CategoryChannel,
  GuildChannel,
  MessageEmbed,
  TextBasedChannels,
  ThreadChannel,
} from 'discord.js';
import { parseDay, send } from './common';
import DiscordBot from './DiscordBot';

export default class ChannelUpdater {
  #now: Date = new Date();

  checkToday(): void {
    this.#now = new Date();
    this.#now.setHours(this.#now.getHours() - 6); // Because the bot is hosted on a server with CET time zone…
    const nextDay: Date = new Date(
      this.#now.getFullYear(),
      this.#now.getMonth(),
      this.#now.getDate(),
      0,
      0,
      0,
      0
    );
    nextDay.setDate(this.#now.getDate() + 1);
    setTimeout(
      this.checkToday.bind(this),
      nextDay.getTime() - this.#now.getTime()
    );

    for (const guild of DiscordBot._client.guilds.cache.toJSON()) {
      const currentYearCategory: CategoryChannel | undefined =
        guild.channels.cache
          .toJSON()
          .find(
            (channel: GuildChannel | ThreadChannel): boolean =>
              channel.type === 'GUILD_CATEGORY' &&
              channel.name.toLowerCase() === this.#now.getFullYear().toString()
          ) as CategoryChannel;
      if (!currentYearCategory) continue;
      const today: string = parseDay(this.#now);
      const todayChannel: TextBasedChannels = currentYearCategory
        .createChannel(`${this.#now.getFullYear()}-${today}`, {
          type: 'GUILD_TEXT',
          reason: `AOC Channel for ${this.#now.getFullYear()}-${today}`,
        })
        .catch(console.error) as TextBasedChannels;
      if (!todayChannel) continue;

      send(
        todayChannel as TextBasedChannels,
        new MessageEmbed()
          .setTimestamp(new Date())
          .setTitle('Advent of Code')
          .setDescription(
            `New day, new challenge! Visit the [Advent of Code website day ${today}](https://adventofcode.com/${this.#now.getFullYear()}/day/${this.#now.getDate()})`
          )
      );
    }
  }
}

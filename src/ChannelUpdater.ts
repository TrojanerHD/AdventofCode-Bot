import { EmbedBuilder } from '@discordjs/builders';
import {
  CategoryChannel,
  ChannelType,
  GuildChannel,
  TextChannel,
  ThreadChannel,
} from 'discord.js';
import { aocTime, parseDay, send } from './common';
import DiscordBot from './DiscordBot';

export default class ChannelUpdater {
  #now: Date = new Date();
  #today: string | undefined;

  checkToday(): void {
    this.#now = new Date();
    this.#now.setHours(
      this.#now.getHours() + this.#now.getTimezoneOffset() / 60 - 5
    );
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
    if (!aocTime(nextDay)) {
      if (nextDay.getMonth() == 11)
        nextDay.setFullYear(nextDay.getFullYear() + 1);
      nextDay.setMonth(11);
      nextDay.setDate(1);
    }
    let timeoutTime = nextDay.getTime() - this.#now.getTime();
    // Ensures that timeoutTime never is larger than (2^31)-1.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value
    if (timeoutTime > 2 ** 31 - 1) timeoutTime = 2 ** 31 - 1;
    setTimeout(this.checkToday.bind(this), timeoutTime);
    if (!aocTime(this.#now)) return;

    for (const guild of DiscordBot._client.guilds.cache.toJSON()) {
      const currentYearCategory: CategoryChannel | undefined =
        guild.channels.cache
          .toJSON()
          .find(
            (channel: GuildChannel | ThreadChannel): boolean =>
              channel.type === ChannelType.GuildCategory &&
              channel.name.toLowerCase() === this.#now.getFullYear().toString()
          ) as CategoryChannel;
      if (!currentYearCategory) continue;
      this.#today = parseDay(this.#now);
      if (
        guild.channels.cache.find(
          (channel: GuildChannel | ThreadChannel): boolean =>
            channel.type === ChannelType.GuildText &&
            channel.name === `${this.#now.getFullYear()}-${this.#today}`
        )
      )
        continue;
      currentYearCategory.children
        .create({
          name: `${this.#now.getFullYear()}-${this.#today}`,
          type: ChannelType.GuildText,
          reason: `AOC Channel for ${this.#now.getFullYear()}-${this.#today}`,
          position: 0
        })
        .then(this.sendMessage.bind(this))
        .catch(console.error);
    }
  }

  sendMessage(channel: TextChannel): void {
    send(
      channel,
      new EmbedBuilder()
        .setTimestamp(new Date())
        .setTitle('Advent of Code')
        .setDescription(
          `New day, new challenge! Visit the [Advent of Code website day ${
            this.#today
          }](https://adventofcode.com/${this.#now.getFullYear()}/day/${this.#now.getDate()})`
        )
    );
  }
}

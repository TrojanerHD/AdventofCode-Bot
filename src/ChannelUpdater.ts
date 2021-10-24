import {
  CategoryChannel,
  GuildChannel,
  MessageEmbed,
  TextBasedChannels,
  TextChannel,
} from 'discord.js';
import { parseDay, send } from './common';
import DiscordBot from './DiscordBot';

export default class ChannelUpdater {
  private _now: Date = new Date();

  checkToday(): void {
    this._now = new Date();
    this._now.setHours(this._now.getHours() - 6); // Because the bot is hosted on a server with CET time zone…
    this._now.setDate(this._now.getDate() - 1);
    const nextDay: Date = new Date(
      this._now.getFullYear(),
      this._now.getMonth(),
      this._now.getDate(),
      0,
      0,
      0,
      0
    );
    nextDay.setDate(this._now.getDate() + 1);
    setTimeout(
      this.checkToday.bind(this),
      nextDay.getTime() - this._now.getTime()
    );
    for (const guild of DiscordBot._client.guilds.cache.toJSON()) {
      const soonChannel: CategoryChannel | undefined = guild.channels.cache
        .toJSON()
        .find(
          (channel: GuildChannel) =>
            channel.type === 'GUILD_CATEGORY' &&
            channel.name.toLowerCase() === 'soon :tm:'
        ) as CategoryChannel;
      if (!soonChannel) continue;
      const today: string = parseDay(this._now);
      const todayChannel: GuildChannel | undefined = soonChannel.children.find(
        (channel: GuildChannel): boolean =>
          channel.name.toLowerCase() === `${this._now.getFullYear()}-${today}`
      );
      if (!todayChannel) continue;
      todayChannel
        .setParent(
          guild.channels.cache.find(
            (channel: GuildChannel): boolean =>
              channel.type === 'GUILD_CATEGORY' &&
              channel.name.toLowerCase() === '2020'
          ) as CategoryChannel
        )
        .catch(console.error);
      send(
        todayChannel as TextBasedChannels,
        new MessageEmbed()
          .setTimestamp(new Date())
          .setTitle('Advent of Code')
          .setDescription(
            `New day, new challenge! Visit the [Advent of Code website day ${today}](https://adventofcode.com/2020/day/${this._now.getDate()})`
          )
      );
    }
  }
}

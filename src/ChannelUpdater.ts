import {
  CategoryChannel,
  GuildChannel,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import DiscordBot from './DiscordBot';

export default class ChannelUpdater {
  private _now: Date = new Date();
  constructor() {
    DiscordBot._client.on('ready', this.onReady.bind(this));
  }

  private onReady(): void {
    this.checkToday();
  }

  private checkToday(): void {
    this._now = new Date();
    this._now.setHours(this._now.getHours() - 6); // Because the bot is hosted on a server with CET time zone…
    const nextDay: Date = new Date(
      this._now.getFullYear(),
      this._now.getMonth(),
      this._now.getDate(),
      6,
      0,
      0,
      0
    );
    nextDay.setDate(this._now.getDate() + 1);
    setTimeout(
      this.checkToday.bind(this),
      nextDay.getTime() - this._now.getTime()
    );
    for (const guild of DiscordBot._client.guilds.cache.array()) {
      const soonChannel:
        | GuildChannel
        | undefined = guild.channels.cache
        .array()
        .find(
          (channel: GuildChannel) =>
            channel.type === 'category' &&
            channel.name.toLowerCase() === 'soon :tm:'
        );
      if (!soonChannel) continue;
      const today: string = this.parseDay();
      const todayChannel: GuildChannel | undefined = (<CategoryChannel>(
        soonChannel
      )).children.find(
        (channel: GuildChannel) => channel.name.toLowerCase() === today
      );
      if (!todayChannel) continue;
      todayChannel
        .setParent(
          <CategoryChannel>(
            guild.channels.cache.find(
              (channel: GuildChannel) =>
                channel.type === 'category' &&
                channel.name.toLowerCase() === '2020'
            )
          )
        )
        .catch(console.error);
      (<TextChannel>todayChannel).send(
        new MessageEmbed()
          .setTimestamp(new Date())
          .setTitle('Advent of Code')
          .setDescription(
            `New day, new challenge! Visit the [Advent of Code website day ${today}](https://adventofcode.com/2020/day/${this._now.getDay()})`
          )
      );
    }
  }

  private parseDay(): string {
    let day: string = this._now.getDate().toString();
    return this._now.getDate() < 10 ? `0${day}` : day;
  }
}

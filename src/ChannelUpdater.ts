import { CategoryChannel, Guild, GuildChannel, MessageEmbed, TextChannel } from 'discord.js';
import DiscordBot from './DiscordBot';

export default class ChannelUpdater {
  constructor() {
    DiscordBot._client.on('ready', this.onReady.bind(this));
  }

  private onReady(): void {
    this.checkToday();
  }

  private checkToday(): void {
    const now: Date = new Date();
    const nextDay: Date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    nextDay.setDate(now.getDate() + 1);
    setTimeout(
      this.checkToday.bind(this),
      nextDay.getTime() - now.getTime()
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
        (channel: GuildChannel) =>
          channel.name.toLowerCase() === today
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
        (<TextChannel> todayChannel).send(new MessageEmbed().setTimestamp(new Date()).setTitle('Advent of Code').setDescription(`New day, new challenge! Visit the [Advent of Code website day ${today}](Insert url here)`))
    }
  }

  private parseDay(): string {
    const date: Date = new Date();
    let day: string = date.getDate().toString();
    return date.getDate() < 10 ? `0${day}` : day;
  }
}

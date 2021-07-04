import * as Discord from 'discord.js';
import ChannelUpdater from './ChannelUpdater';
import DatabaseHelper from './DatabaseHelper';
import Leaderboard from './Leaderboard';

export default class DiscordBot {
  static _client: Discord.Client;
  static _db: DatabaseHelper;
  constructor() {
    DiscordBot._db = new DatabaseHelper('configuration.sqlite', () => {
      DiscordBot._client = new Discord.Client();
      DiscordBot._client.login(process.env.TOKEN).catch(console.error);
      DiscordBot._client.on('ready', this.onReady.bind(this));
    });
  }

  private onReady(): void {
    new ChannelUpdater().checkToday();
    if (process.env.LEADERBOARD_ID && process.env.AOC_SESSION)
      new Leaderboard().onReady();
  }
}

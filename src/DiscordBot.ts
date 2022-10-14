import {
  Client,
  Collection,
  GatewayIntentBits,
  GuildChannel,
  ThreadChannel,
  ThreadMember,
} from 'discord.js';
import ChannelUpdater from './ChannelUpdater';
import Leaderboard from './Leaderboard';
import ReactionHandler from './commands/handlers/ReactionHandler';
import MessageHandler from './commands/handlers/MessageHandler';

export default class DiscordBot {
  static _client: Client;

  constructor() {
    DiscordBot._client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    DiscordBot._client.login(process.env.TOKEN).catch(console.error);
    DiscordBot._client.on('ready', this.onReady.bind(this));
    DiscordBot._client.on('threadCreate', this.onThreadCreate.bind(this));
  }

  private onReady(): void {
    this.joinAllThreads();
    new ReactionHandler();
    new MessageHandler();
    new ChannelUpdater().checkToday();
    if (process.env.LEADERBOARD_ID && process.env.AOC_SESSION)
      new Leaderboard().onReady();
  }

  private joinAllThreads(): void {
    for (const guild of DiscordBot._client.guilds.cache.toJSON())
      for (const threadChannel of (
        guild.channels.cache.filter(
          (channel: GuildChannel | ThreadChannel): boolean =>
            channel instanceof ThreadChannel &&
            !channel.members.cache.find(
              (member: ThreadMember): boolean =>
                member.user!.id === DiscordBot._client.user!.id
            )
        ) as Collection<string, ThreadChannel>
      ).toJSON())
        threadChannel.join().catch(console.error);
  }

  private onThreadCreate(thread: ThreadChannel): void {
    thread.join().catch(console.error);
  }
}

import {
  Message,
  MessageEmbed,
  GuildChannel,
  TextChannel,
  Collection,
} from 'discord.js';
import DiscordBot from './DiscordBot';
import { request } from 'https';
import { IncomingMessage } from 'http';


interface Day {
  1: { get_star_ts: string};
  2?: { get_star_ts: string};
}
interface Member {
  completion_day_level: {
    1?: Day;
    2?: Day;
    3?: Day;
    4?: Day;
    5?: Day;
    6?: Day;
    7?: Day;
    8?: Day;
    9?: Day;
    10?: Day;
    11?: Day;
    12?: Day;
    13?: Day;
    14?: Day;
    15?: Day;
    16?: Day;
    17?: Day;
    18?: Day;
    19?: Day;
    20?: Day;
    21?: Day;
    22?: Day;
    23?: Day;
    24?: Day;
    25?: Day;
  };
  last_star_ts: number;
  local_score: number;
  stars: number;
  name: string;
}

export default class Leaderboard {
  private _messages: Message[] = [];
  private _leaderboardChannel: TextChannel;

  onReady(): void {
    // get all guilds the bot is on
    for (const guild of DiscordBot._client.guilds.cache.array()) {
      // check if these guilds have a text channel named 'leaderboard'
      const leaderboardChannel: GuildChannel = guild.channels.cache
        .array()
        .find(
          (channel: GuildChannel): boolean =>
            channel.name === 'leaderboard' && channel.type === 'text'
        );
      if (!leaderboardChannel || !(leaderboardChannel instanceof TextChannel))
        continue;

      this._leaderboardChannel = leaderboardChannel;

      // get the latest message in the channel and check if it originated from this bot
      this._leaderboardChannel.messages
        .fetch({ limit: 1 })
        .then(this.messagesFetched.bind(this))
        .catch(console.error);
    }
  }

  private messagesFetched(messages: Collection<string, Message>): void {
    const now: Date = new Date();
    if (messages.first() && messages.first().member.user === DiscordBot._client.user)
      // add to messages array
      this._messages.push(messages.first());
    else {
      // create message and add to messages array
      this._leaderboardChannel
        .send(
          new MessageEmbed()
            .setColor('#0f0f23')
            .setTitle(`Advent Of Code ${now.getFullYear()} Leaderboard`)
            .setURL(
              `https://adventofcode.com/${now.getFullYear()}/leaderboard/private/view/${
                process.env.LEADERBOARD_ID
              }`
            )
            .setDescription('FIRST TIME SETUP...')
            .setTimestamp(now)
        )
        .then((message: Message): number => this._messages.push(message))
        .catch(console.error);
    }

    // update Leaderbaord the first time
    this.updateLeaderboard();
  }

  private updateLeaderboard(): void {
    // re-call this function in 30 minutes
    setTimeout(
      this.updateLeaderboard.bind(this),
      1800000 //30 minutes
    );

    const now: Date = new Date();

    console.log(`${now}: refreshing Leaderboard`);

    // fetch API
   request(
      {
        host: 'adventofcode.com',
        path: `/${now.getFullYear()}/leaderboard/private/view/${
          process.env.LEADERBOARD_ID
        }.json`,
        headers: { Cookie: `session=${process.env.AOC_SESSION}` },
      },
      (res: IncomingMessage): void => {
        // wait for data
        res.on('data', this.dataReceived.bind(this));
      }
    )
      .on('error', console.error)
      .end();
  }

  private dataReceived(data: string): void {
    const now: Date = new Date();
    const nextUpdate: Date = new Date(now.getTime() + 1800000);
    let leaderboardData: { members: Member[] } = JSON.parse(data);

    let newMsg: MessageEmbed = new MessageEmbed()
      .setColor('#0f0f23')
      .setTitle(`Advent Of Code ${now.getFullYear()} - Leaderboard`)
      .setURL(
        `https://adventofcode.com/${nextUpdate.getFullYear()}/leaderboard/private/view/${
          process.env.LEADERBOARD_ID
        }`
      )
      .setDescription(`Next update: ${nextUpdate.toLocaleTimeString()}`)
      .setTimestamp(now);

    // convert from object to array
    let members: Member[] = Object.values(leaderboardData.members);

    // sort based on local score
    members.sort((a: Member, b: Member): number => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      else return b.local_score - a.local_score;
    });

    // add members to embed
    for (const member of members) {
      if (member.stars === 0) continue;
      let stars: string = '';

      for (let i = 1; i < 26; i++) {
        if (i in member.completion_day_level) {
          if (member.completion_day_level[i][2]){
            // part 1 and 2 are complete
            const completed_ts: number = Number(member.completion_day_level[i][2].get_star_ts)*1000;

            // check if star is younger than an hour
            if (completed_ts - (now.getTime() - 3600000/*one hour*/) > 0){
              // star is younger than one hour
              stars += ':star2:';
              
            } else if(completed_ts-10800000 < this.getDay(now, i).getTime()) { //TODO: this doesn't work
              // member completed day in under 3 hours
              stars += ':sparkles:';
            }
            else stars += ':star:'; // star is older than one hour and was not completet inside the 3 hours after release
          }
          else stars += ':last_quarter_moon:';  // part 1 is complete, but not part 2
          continue;
        }
        stars += ':new_moon:';  // no part is complete
      }

      newMsg.addField(member.name, stars);
    }

    // update all leaderbaord messages
    for (const msg of this._messages) msg.edit(newMsg).catch(console.error);
  }

  private getDay(now: Date, day: number): Date {
    return new Date(`${now.getFullYear()}-12-${("0" + day).slice(-2)}T00:00:00-05:00`);
  }
}

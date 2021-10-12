import {
  Message,
  MessageEmbed,
  GuildChannel,
  TextChannel,
  Collection,
  Guild,
} from 'discord.js';
import DiscordBot from './DiscordBot';
import { request } from 'https';
import { IncomingMessage, Server } from 'http';
import { parseDay } from './common';
import { ServerInfo} from './DatabaseHelper';
import * as fs from 'fs';

interface Day {
  1: { get_star_ts: string };
  2?: { get_star_ts: string };
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
  private _overwriteApi: string | undefined;

  constructor() {
    for (let i = 0; i < process.argv.length; i++) {
      const arg: string = process.argv[i];
      if (arg === '--overwrite-api')
        if (process.argv.length >= i + 2) {
          const file: string = process.argv[i + 1];
          if (fs.existsSync(file))
            this._overwriteApi = fs.readFileSync(file, 'utf-8');
        }
    }
  }

  onReady(): void {
    this.updateLeaderboards();
  }

  private handleGuild(guild: Guild, serverInfo: ServerInfo): void {
    if (!serverInfo.enableLeaderboard
        || !serverInfo.aocLeaderboardID
        || !serverInfo.aocSession)
      return;

    // check if the guild has a text channel named 'leaderboard'
    const leaderboardChannel: GuildChannel = guild.channels.cache
      .array()
      .find(
        (channel: GuildChannel): boolean =>
          channel.name === 'leaderboard' && channel.type === 'text'
      );
    console.debug(leaderboardChannel)
    if (!leaderboardChannel || !(leaderboardChannel instanceof TextChannel))
      return;

    this._leaderboardChannel = leaderboardChannel;

    // get the latest message in the channel and check if it originated from this bot
    this._leaderboardChannel.messages
      .fetch({ limit: 1 })
      .then(this.messagesFetched.bind(this, serverInfo))
      .catch(console.error);
  }

  private messagesFetched(serverInfo: ServerInfo, messages: Collection<string, Message>): void {
    const now: Date = new Date();
    if (
      messages.first() &&
      messages.first().member.user === DiscordBot._client.user
    )
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
                serverInfo.aocLeaderboardID
              }`
            )
            .setDescription('FIRST TIME SETUP...')
            .setTimestamp(now)
        )
        .then((message: Message): number => this._messages.push(message))
        .catch(console.error);
    }

    // update Leaderbaord the first time
    this.updateLeaderboard(serverInfo);
  }

  private updateLeaderboards(): void {
    // get all guilds the bot is on
    for (const guild of DiscordBot._client.guilds.cache.array()) {
      DiscordBot._db.getServer(guild.id).then(serverInfo => this.handleGuild(guild, serverInfo));
    }

    // re-call this function in 30 minutes
    setTimeout(
      this.updateLeaderboard.bind(this),
      1800000 //30 minutes
    );
  }

  private updateLeaderboard(serverInfo: ServerInfo): void {
    const now: Date = new Date();

    console.log(`${now}: refreshing Leaderboard`);

    if (this._overwriteApi) {
      this.dataReceived(serverInfo, this._overwriteApi);
      return;
    }
    console.debug(serverInfo);
    console.debug(`/${now.getFullYear()}/leaderboard/private/view/${serverInfo.aocLeaderboardID}.json`);
    // fetch API
    request(
      {
        host: 'adventofcode.com',
        path: `/${now.getFullYear()}/leaderboard/private/view/${
          serverInfo.aocLeaderboardID
        }.json`,
        headers: { Cookie: `session=${serverInfo.aocSession}` },
      },
      (res: IncomingMessage): void => {
        // wait for data
        res.on('data', this.dataReceived.bind(this, serverInfo));
      }
    )
      .on('error', console.error)
      .end();
  }

  private dataReceived(serverInfo: ServerInfo, data: string): void {
    const now: Date = new Date();
    const nextUpdate: Date = new Date(now.getTime() + 1800000);
    let leaderboardData: { members: Member[] } = JSON.parse(data);

    let newMsg: MessageEmbed = new MessageEmbed()
      .setColor('#0f0f23')
      .setTitle(`Advent Of Code ${now.getFullYear()} - Leaderboard`)
      .setURL(
        `https://adventofcode.com/${nextUpdate.getFullYear()}/leaderboard/private/view/${
          serverInfo.aocLeaderboardID
        }`
      )
      .setDescription(
        `:new_moon:: No part of the day is completed\n:last_quarter_moon:: Part 1 out of 2 is completed\n:star2:: Both part 1 and part 2 were completed during the last hour\n:star:: Both part 1 and part 2 are completed\n:sparkles:: Both part 1 and part 2 were completed within the first 3 hours the challenge was online.\n\nNext update: ${nextUpdate.toLocaleTimeString()}`
      )
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
          if (member.completion_day_level[i][2]) {
            // part 1 and 2 are complete
            const completed_ts: number =
              Number(member.completion_day_level[i][2].get_star_ts) * 1000;

            // check if star is younger than an hour
            if (completed_ts - (now.getTime() - 3600000) /*one hour*/ > 0) {
              // star is younger than one hour
              stars += ':star2:';
            } else if (
              completed_ts - 10800000 <
              this.getDateOfChallengeBegin(now, i).getTime()
            ) {
              // member completed day in under 3 hours
              stars += ':sparkles:';
            } else stars += ':star:'; // star is older than one hour and was not completet inside the 3 hours after release
          } else stars += ':last_quarter_moon:'; // part 1 is complete, but not part 2
          continue;
        }
        stars += ':new_moon:'; // no part is complete
      }

      newMsg.addField(member.name, stars);
    }

    // update all leaderbaord messages
    for (const msg of this._messages) msg.edit(newMsg).catch(console.error);
  }

  private getDateOfChallengeBegin(now: Date, day: number): Date {
    return new Date(
      `${now.getFullYear()}-12-${parseDay(now, day)}T00:00:00-05:00`
    );
  }
}

import {Message, MessageEmbed, GuildChannel, TextChannel} from 'discord.js';
import { stringify } from 'querystring';
import DiscordBot from './DiscordBot';
import {request} from 'https';

export default class Leaderboard {
  private messages: Message[] = [];

  constructor() {
    DiscordBot._client.on('ready', this.onReady.bind(this));
  }

  private onReady(): void {
    const _now: Date  = new Date();

    // get all gulid's the bot is on
    for (const guild of DiscordBot._client.guilds.cache.array()) {
      // check if these gulids have a text channel named 'leaderboard'
      const leaderboardChannel: GuildChannel = guild.channels.cache.array().find((channel: GuildChannel) => channel.name === 'leaderboard' && channel.type === 'text');
      if (!leaderboardChannel || !(leaderboardChannel instanceof TextChannel)) continue;

      // get the latest message in the channel and check if it originated from this bot 
      leaderboardChannel.messages.fetch({limit:1})
        .then(msgs => {
          if (msgs.first().member.user == DiscordBot._client.user) {
            // add to messages array
            this.messages.push(msgs.first());
          } else {
            // create message and add to messages array
            leaderboardChannel.send(new MessageEmbed()
            .setColor('#0f0f23')
            .setTitle(`Advent Of Code ${_now.getFullYear()} Leaderboard`)
            .setURL(`https://adventofcode.com/${_now.getFullYear()}/leaderboard/private/view/${process.env.LEADERBOARD_ID}`)
            .setDescription("FIRST TIME SETUP...")
            .setTimestamp(_now)).then(m => this.messages.push(m)).catch(console.error);
          }

          // update Leaderbaord the first time
          this.updateLeaderboard();
        });
    }
  }

  private updateLeaderboard(): void {
    // re-call this function in 30 minutes
    setTimeout(
      this.updateLeaderboard.bind(this),
      1800000 //30 minutes
    );

    const _now = new Date();
    const nextUpdate = new Date(_now.getTime() + 1800000);

    console.log(`${_now}: refreshing Leaderboard`);

    // fetch API
    request({
      host: 'adventofcode.com',
      path: `/${_now.getFullYear()}/leaderboard/private/view/${process.env.LEADERBOARD_ID}.json`,
      headers: {'Cookie': `session=${process.env.AOC_SESSION}`}
    }, res => {
      // wait for data
      res.on('data', d => {
        let leaderboardData = JSON.parse(d);

        let newMsg: MessageEmbed = new MessageEmbed()
          .setColor('#0f0f23')
          .setTitle(`Advent Of Code ${_now.getFullYear()} - Leaderboard`)
          .setURL(`https://adventofcode.com/${nextUpdate.getFullYear()}/leaderboard/private/view/${process.env.LEADERBOARD_ID}`)
          .setDescription(`next update: ${nextUpdate.toLocaleTimeString()}`)
          .setTimestamp(_now);


        // convert from object to array
        let members = [];
        for (const member in leaderboardData['members']) {
          members.push(leaderboardData['members'][member]);
        }

        // sort for star amount and last star timestamp
        members.sort((a, b): number => {
          if (a['last_star_ts'] == 0) a['last_star_ts'] += 9999999999;
          if (b['last_star_ts'] == 0) b['last_star_ts'] += 9999999999;
          return b['stars']- a['stars'] + a['last_star_ts'] - b['last_star_ts'];
        });

        // add members to embed
        for (const member of members) {
          let stars = '';
          for (let i = 0; i < Math.floor(member['stars']/2); i++) stars += ':star:';
          if (member['stars'] % 2)  stars += ':last_quarter_moon:';
          for (let i = Math.round(member['stars']/2); i < 24; i++) stars += ':new_moon:';

          newMsg.addField(member['name'], stars);
        }

        // update all leaderbaord messages
        for (const msg of this.messages) {
          msg.edit(newMsg);
        }
      });
    }).on('error', console.error).end();
  }
}
import DiscordBot from './DiscordBot';
import ChannelUpdater from './ChannelUpdater';
import Leaderboard from './Leaderboard';

new DiscordBot();
new ChannelUpdater();
if (process.env.LEADERBOARD_ID && process.env.AOC_SESSION)
    new Leaderboard();
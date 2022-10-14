import {
  ApplicationCommandData,
  ColorResolvable,
  CommandInteractionOption,
  GuildMember,
  Interaction,
  PermissionFlagsBits,
  Role,
} from 'discord.js';
import Settings from '../Settings';
import Command, { Reply } from './Command';

export default class UserColorCommand implements Command {
  deploy: ApplicationCommandData = {
    name: 'color',
    description: 'Changes the color of your username',
    options: [
      {
        type: 1,
        name: 'set',
        description: 'Set your color',
        options: [
          {
            type: 3,
            name: 'color',
            description: 'Hex color code',
            required: true,
          },
        ],
      },
      {
        type: 1,
        name: 'reset',
        description: 'Resets your color',
        options: [],
      },
    ],
    dmPermission: false,
  };

  handleCommand(
    args: readonly CommandInteractionOption[],
    interaction: Interaction
  ): Reply {
    switch (args[0].name) {
      case 'set':
        if (!Settings.getSettings()['user-color'])
          return { reply: 'You are not allowed to do that', ephemeral: true };
        if (!interaction.inGuild())
          return {
            reply: 'This command is only available in guilds',
            ephemeral: true,
          };
        let color: string = args[0].options![0].value!.toString();
        if (!color.startsWith('#')) color = `#${color}`;
        if (!color) return { reply: 'No color provided', ephemeral: true };
        if (!color.match(/^#[a-f0-9]{6}$/i))
          return {
            reply: `Color code ${color} invalid`,
            ephemeral: true,
          };
        const role: Role | undefined = interaction
          .guild!.roles.cache.toJSON()
          .find(
            (findRole: Role): boolean =>
              findRole.name === interaction.user.username
          );
        if (!role) {
          interaction
            .guild!.roles.create({
              color: color as ColorResolvable,
              name: interaction.user.username,
            })
            .then(
              (createdRole: Role): Promise<void | GuildMember> =>
                (interaction.member as GuildMember).roles
                  .add(createdRole)
                  .catch(console.error)
            )
            .catch(console.error);
          return {
            reply: `Your name color is now ${color}`,
            ephemeral: true,
          };
        }

        role.edit({ color: color as ColorResolvable }).catch(console.error);
        return { reply: `Your name color is now ${color}` };
      case 'reset':
        const removeRole: Role | undefined = (
          interaction.member as GuildMember
        ).roles.cache
          .toJSON()
          .find(
            (findRole: Role) => findRole.name === interaction.user.username
          );
        if (!removeRole)
          return {
            reply:
              'You did not assign yourself a number thus it cannot be reset',
            ephemeral: true,
          };
        removeRole.delete().catch(console.error);
        return { reply: 'Your name color has been reset', ephemeral: true };
      default:
        return { reply: 'Something went wrong', ephemeral: true };
    }
  }
}

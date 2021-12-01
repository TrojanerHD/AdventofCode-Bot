import {
  ApplicationCommandPermissionData,
  Collection,
  Guild,
  Role,
  Snowflake,
} from 'discord.js';
import Settings from '../Settings';
import { ApplicationCommandType } from './handlers/CommandHandler';

export default class CommandPermissions {
  #guild: Guild;

  constructor(guild: Guild) {
    this.#guild = guild;
  }

  onCommandSet(commands: Collection<Snowflake, ApplicationCommandType>): void {
    for (const command of commands.toJSON())
      if (!command.defaultPermission)
        command.permissions
          .add({
            guild: this.#guild,
            permissions: Settings.getSettings()['permission-roles'].map(
              (roleName: string): ApplicationCommandPermissionData => ({
                id: this.#guild.roles.cache.find(
                  (role: Role): boolean => role.name === roleName
                )!.id,
                permission: true,
                type: 'ROLE',
              })
            ),
          })
          .catch(console.error);
  }
}

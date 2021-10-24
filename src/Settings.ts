import fs from 'fs';

export interface SettingsJSON {
  'user-color': boolean;
  'permission-roles': string[];
}

export default class Settings {
  static #settingsFile: string = './settings.json';
  static #settings: SettingsJSON = {
    'user-color': false,
    'permission-roles': [],
  };

  static getSettings(): SettingsJSON {
    if (!fs.existsSync(Settings.#settingsFile)) {
      Settings.saveSettings();
      return Settings.#settings;
    }
    const settingsFileContent: string = fs.readFileSync(
      Settings.#settingsFile,
      'utf-8'
    );
    if (!Settings.isJsonString(settingsFileContent)) Settings.saveSettings();
    else Settings.#settings = JSON.parse(settingsFileContent);
    return Settings.#settings;
  }

  private static isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e: any) {
      return false;
    }
    return true;
  }

  private static saveSettings(): void {
    fs.writeFileSync(
      Settings.#settingsFile,
      JSON.stringify(Settings.#settings, null, 2),
      'utf-8'
    );
  }
}

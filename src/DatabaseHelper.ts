import { Database, RunResult } from 'sqlite3';

export interface ServerInfo {
  id: string;
  enableLeaderboard: boolean;
  enableChannelUpdater: boolean;
  aocSession?: string;
  aocLeaderboardID?: number;
  channelNamePattern?: string;
  categoryNamePattern?: string;
}

export default class DatabaseHelper {
  private _db: Database;

  constructor(file: string, callback?: ()=>void) {
    this._db = new Database(file);
    this.initDatabase().then(callback).catch(console.error);
  }

  /**
   * Gets a server's configuration from the database
   * @param id The Guild ID to identify the rows
   * @returns A promise of a ServerInfo interface containing all of the row's data
   */
  public getServer(id: string): Promise<ServerInfo> {
    return new Promise<ServerInfo>((resolve, reject) => {
      this.getRow(`SELECT * FROM servers WHERE id=?;`, [id])
        .then((row: any) => {
          if (row) resolve(row);
          else
            resolve({
              id: id,
              enableLeaderboard: false,
              enableChannelUpdater: false,
            });
        })
        .catch(reject);
    });
  }

  /**
   * Updates data in the database. The row to be updated is chosen from the ID in the data object.
   * Creates a new row if no row with the provided id exists
   * @param data A ServerInfo object containing the data to be written.
   * @returns A void promise, for error handling only
   */
  public updateServer(data: ServerInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      this.runQuery(
        `
        INSERT INTO servers
          (
            id,
            enableLeaderboard,
            enableChannelUpdater,
            aocSession,
            aocLeaderboardID,
            channelNamePattern,
            categoryNamePattern
          )
          VALUES(?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id)
          DO UPDATE SET
            enableLeaderboard=?,
            enableChannelUpdater=?,
            aocSession=?,
            aocLeaderboardID=?,
            channelNamePattern=?,
            categoryNamePattern=?;`,
        [
          data.id,
          data.enableLeaderboard,
          data.enableChannelUpdater,
          data.aocSession,
          data.aocLeaderboardID,
          data.channelNamePattern,
          data.categoryNamePattern,
          data.enableLeaderboard,
          data.enableChannelUpdater,
          data.aocSession,
          data.aocLeaderboardID,
          data.channelNamePattern,
          data.categoryNamePattern,
        ]
      )
        .then(resolve)
        .catch((err: Error) => reject(err));
    });
  }

  /**
   * Creates all required tables if they don't exist.
   * @returns A void promise, for error handling only
   */
  private initDatabase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.runQuery(
        `
        CREATE TABLE IF NOT EXISTS servers (
          id VARCHAR(20) NOT NULL PRIMARY KEY,
          enableLeaderboard BOOLEAN NOT NULL DEFAULT 0,
          enableChannelUpdater BOOLEAN NOT NULL DEFAULT 0,
          aocSession VARCHAR(100),
          aocLeaderboardID INTEGER,
          channelNamePattern VARCHAR(50),
          categoryNamePattern VARCHAR(50)
        );`,
        []
      )
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * A wrapper around the Database.run function of the sqlite3 library
   * @param sql The SQL query to be executed
   * @param params Parameters for placeholders. Automatically sanitized
   * @returns A void promise, for error handling only
   */
  private runQuery(sql: string, params: any[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._db.run(sql, params, (err: Error) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  /**
   * A wrapper around the Database.get function of the sqlite3 library
   * @param sql The SQL query to be executed
   * @param params Parameters for placeholders. Automatically sanitized
   * @returns A promise for an any object containing the data of the row the query fetched
   */
  private getRow(sql: string, params: any[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this._db.get(sql, params, (err: Error, row: any) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  /**
   * A wrapper around the Database.all function of the sqlite3 library
   * @param sql The SQL query to be executed
   * @param params Parameters for placeholders. Automatically sanitized
   * @returns A promise for an any array containing all rows the query fetched
   */
  private getAllRows(sql: string, params: any[]): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this._db.all(sql, params, (err: Error, rows: any[]) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
}

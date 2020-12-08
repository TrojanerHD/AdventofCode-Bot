import { Server } from 'http';
import { Database, RunResult, Statement } from 'sqlite3';

export default interface ServerInfo {
  id: string;
  enableleaderboard: boolean;
  enableChannelUpdater: boolean;
  aocSession: string;
  aocLeaderboardID: number;
  channelNamePattern: string;
  categoryNamePattern: string;
}

export default class DatabaseHelper {
  public _db: Database;

  constructor(file: string) {
    this._db = new Database(file);
    this.initDatabase();
  }

  /**
   * Gets a server's configuration from the database
   * @param id the Guild ID to identify the rows
   * @returns a promise of a ServerInfo interface containing all of the row's data
   */
  public getServer(id: string): Promise<ServerInfo> {
    return new Promise<ServerInfo>((resolve, reject) => {
      this.getRow(`SELECT * FROM servers WHERE id=?;`, [id])
        .then((row) => {
          resolve(row);
        })
        .catch(reject);
    });
  }

  /**
   * updates data in the database. the row to be updated is choosen from the ID in the data object.
   * If no row with the provided id exists, creates a new one
   * @param data a ServerInfo object containing the data to be written.
   * @returns a void promise, for error andling only
   */
  public updateServer(data: ServerInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      this.runQuery(
        `
        UPDATE servers SET
        enableLeaderboard=?,
        enableChannelUpdater=?,
        aocSession=?,
        aocLeaderboardID=?,
        channelNamePattern=?,
        categortyNamePattern=?
        WHERE id=?;`,
        [
          data.enableleaderboard,
          data.enableChannelUpdater,
          data.aocSession,
          data.aocLeaderboardID,
          data.channelNamePattern,
          data.categoryNamePattern,
          data.id,
        ]
      )
        .then(resolve)
        .catch((err) => reject(err));
    });
  }

  /**
   * Creates all required tables if they don't exist.
   * @returns a void promise, for error handling only
   */
  private initDatabase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.runQuery(
        `
        CREATE TABLE IF NOT EXISTS servers (
          id INTEGER NOT NULL PRIMARY KEY,
          enableLeaderboard INTEGER NOT NULL DEFAULT 0,
          enableChannelUpdater INTEGER NOT NULL DEFAULT 0,
          aocSession Text,
          aocLeaderboardID INTEGER,
          channelNamePattern TEXT,
          categortyNamePattern TEXT
        );`,
        []
      )
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * A wrapper around the Database.run function of the sqlite3 library
   * @param sql the SQL query to be executed
   * @param params parameters for placeholders. Automatically sanitized
   * @returns a void promise, for error handling only
   */
  private runQuery(sql: string, params: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this._db.run(sql, params, (result: RunResult, err: Error) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  /**
   * A wrapper around the Database.get function of the sqlite3 library
   * @param sql the SQL query to be executed
   * @param params parameters for placeholders. Automatically sanitized
   * @returns a promise for an any object containing the data of the row the query fetched
   */
  private getRow(sql: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db.get(sql, params, (err: Error, row: any) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  /**
   * A wrapper around the Database.all function of the sqlite3 library
   * @param sql the SQL query to be executed
   * @param params parameters for placeholders. Automatically sanitized
   * @returns a promise for an any array containing all rows the query fetched
   */
  private getAllRows(sql: string, params: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._db.all(sql, params, (err: Error, rows: any[]) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
}

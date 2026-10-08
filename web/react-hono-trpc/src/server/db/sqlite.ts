import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type SqliteRunResult = {
  changes: number;
  lastInsertRowid?: bigint | number;
};

export type SqliteStatement = {
  all<T = unknown>(...params: unknown[]): T[];
  get<T = unknown>(...params: unknown[]): T | undefined;
  run(...params: unknown[]): SqliteRunResult;
};

export type SqliteDatabase = {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
};

type BunDatabaseConstructor = new (path: string) => {
  exec(sql: string): void;
  query(sql: string): SqliteStatement;
};

const isBunRuntime = () => typeof Bun !== "undefined";

const importRuntime = async <T>(specifier: string): Promise<T> => import(/* @vite-ignore */ specifier) as Promise<T>;

export const createSqliteDatabase = async (path: string): Promise<SqliteDatabase> => {
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }

  if (isBunRuntime()) {
    const sqlite = await importRuntime<{ Database: BunDatabaseConstructor }>("bun:sqlite");
    const Database = sqlite.Database;
    const db = new Database(path);
    db.exec("PRAGMA foreign_keys = ON");

    return {
      exec: (sql) => db.exec(sql),
      prepare: (sql) => db.query(sql),
    };
  }

  const sqlite = await importRuntime<typeof import("node:sqlite")>("node:sqlite");
  const db = new sqlite.DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON");

  return {
    exec: (sql) => db.exec(sql),
    prepare: (sql) => db.prepare(sql) as SqliteStatement,
  };
};

import type { Context } from "hono";
import type { SessionUser } from "../auth/repository";
import type { SqliteDatabase } from "../db/sqlite";
import type { Env } from "../env";

export type TrpcContext = {
  c: Context;
  db: SqliteDatabase;
  env: Env;
  responseHeaders: Headers;
  user: SessionUser | undefined;
};

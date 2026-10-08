import { TRPCError } from "@trpc/server";
import type { SqliteDatabase } from "../db/sqlite";
import { hashPassword, randomToken, sha256, verifyPassword } from "./crypto";
import {
  deleteSessionByTokenHash,
  deleteExpiredSessions,
  findUserByEmail,
  findUserBySessionTokenHash,
  insertSession,
  insertUser,
  toPublicUser,
  type SessionUser,
} from "./repository";

const sessionDays = 7;
const EMAIL_CONFLICT_MESSAGE = "Email is already registered";

export const registerUser = async (db: SqliteDatabase, input: { email: string; password: string }): Promise<SessionUser> => {
  const email = input.email.toLowerCase();
  if (findUserByEmail(db, email)) {
    throw new TRPCError({ code: "CONFLICT", message: EMAIL_CONFLICT_MESSAGE });
  }

  const now = new Date().toISOString();
  const user = {
    createdAt: now,
    email,
    id: crypto.randomUUID(),
    passwordHash: await hashPassword(input.password),
  };

  const didInsert = insertUser(db, user);
  if (!didInsert) {
    throw new TRPCError({ code: "CONFLICT", message: EMAIL_CONFLICT_MESSAGE });
  }

  return toPublicUser(user);
};

export const loginUser = async (db: SqliteDatabase, input: { email: string; password: string }): Promise<SessionUser> => {
  const user = findUserByEmail(db, input.email.toLowerCase());
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
  }

  return toPublicUser(user);
};

export const createSession = async (
  db: SqliteDatabase,
  userId: string,
) => {
  const token = randomToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionDays * 24 * 60 * 60 * 1000);
  deleteExpiredSessions(db, now.toISOString());

  insertSession(db, {
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    id: crypto.randomUUID(),
    tokenHash: await sha256(token),
    userId,
  });
  return { expiresAt, token };
};

export const getUserForToken = async (db: SqliteDatabase, token: string | undefined): Promise<SessionUser | undefined> => {
  if (!token) return undefined;

  return findUserBySessionTokenHash(db, await sha256(token), new Date().toISOString());
};

export const logoutToken = async (db: SqliteDatabase, token: string | undefined): Promise<void> => {
  if (!token) return;

  deleteSessionByTokenHash(db, await sha256(token));
};

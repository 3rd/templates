import type { SqliteDatabase } from "../db/sqlite";

export type User = {
  createdAt: string;
  email: string;
  id: string;
  passwordHash: string;
};

export type SessionUser = {
  email: string;
  id: string;
};

type UserRow = {
  created_at: string;
  email: string;
  id: string;
  password_hash: string;
};

export const toPublicUser = (user: User): SessionUser => ({
  email: user.email,
  id: user.id,
});

const mapUser = (row: UserRow): User => ({
  createdAt: row.created_at,
  email: row.email,
  id: row.id,
  passwordHash: row.password_hash,
});

export const findUserByEmail = (db: SqliteDatabase, email: string): User | undefined => {
  const row = db
    .prepare("SELECT id, email, password_hash, created_at FROM users WHERE email = ?")
    .get<UserRow>(email);
  return row ? mapUser(row) : undefined;
};

export const findUserBySessionTokenHash = (db: SqliteDatabase, tokenHash: string, now: string): SessionUser | undefined =>
  db
    .prepare(
      `
        SELECT users.id, users.email
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      `,
    )
    .get<SessionUser>(tokenHash, now);

export const insertUser = (db: SqliteDatabase, user: User) => {
  const result = db.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING").run(
    user.id,
    user.email,
    user.passwordHash,
    user.createdAt,
  );
  return result.changes > 0;
};

export const insertSession = (
  db: SqliteDatabase,
  session: { createdAt: string; expiresAt: string; id: string; tokenHash: string; userId: string },
): void => {
  db.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)").run(
    session.id,
    session.userId,
    session.tokenHash,
    session.expiresAt,
    session.createdAt,
  );
};

export const deleteSessionByTokenHash = (db: SqliteDatabase, tokenHash: string): void => {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
};

export const deleteExpiredSessions = (db: SqliteDatabase, now: string) => {
  db.prepare("DELETE FROM sessions WHERE id IN (SELECT id FROM sessions WHERE expires_at <= ? ORDER BY expires_at LIMIT 100)").run(now);
};

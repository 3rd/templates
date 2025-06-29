import { Database } from "bun:sqlite";
import { randomUUID } from "crypto";
import { join } from "path";
import { User } from "./models/users";

const DB_PATH = join(import.meta.dir, "../../../db.sqlite");

const initDb = () => {
  try {
    const db = new Database(DB_PATH, { create: true, strict: true });

    db.run("PRAGMA foreign_keys = ON");
    db.run("PRAGMA busy_timeout = 5000");
    db.run("PRAGMA journal_mode = WAL");

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);

    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
};

const db = initDb();

const statements = {
  users: {
    all: db.prepare("SELECT * FROM users ORDER BY createdAt DESC").as(User),
    one: db.prepare("SELECT * FROM users WHERE id = $id").as(User),
    byEmail: db.prepare("SELECT * FROM users WHERE email = $email").as(User),
    insert: db.prepare(
      "INSERT INTO users (id, email, name, createdAt, updatedAt) VALUES ($id, $email, $name, $createdAt, $updatedAt)",
    ),
    update: db.prepare(
      "UPDATE users SET email = $email, name = $name, updatedAt = $updatedAt WHERE id = $id",
    ),
    delete: db.prepare("DELETE FROM users WHERE id = $id"),
  },
};

export const database = {
  users: {
    all: () => statements.users.all.all(),
    one: (id: string) => statements.users.one.get({ id }),
    byEmail: (email: string) => statements.users.byEmail.get({ email }),
    create: (payload: { email: string; name: string }) => {
      const id = randomUUID();
      const now = Date.now();
      const data = { id, ...payload, createdAt: now, updatedAt: now };
      try {
        statements.users.insert.run(data);
        return data;
      } catch (error) {
        if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
          throw new Error("A user with this email already exists");
        }
        throw error;
      }
    },
    update: (id: string, payload: { email?: string; name?: string }) => {
      const existingUser = statements.users.one.get({ id });
      if (!existingUser) {
        throw new Error("User not found");
      }
      const updatedAt = Date.now();
      const data = {
        id,
        email: payload.email ?? existingUser.email,
        name: payload.name ?? existingUser.name,
        updatedAt,
      };
      statements.users.update.run(data);
      return { ...existingUser, ...data };
    },
    delete: (id: string) => {
      const result = statements.users.delete.run({ id });
      return result.changes > 0;
    },
  },

  close: () => db.close(),
  transaction: <T>(fn: () => T): T => db.transaction(fn)(),
};

const seedData = () => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };

  if (userCount.count === 0) {
    console.log("Seeding database with initial data...");

    database.users.create({
      email: "john@example.com",
      name: "John Doe",
    });
    database.users.create({
      email: "jane@example.com",
      name: "Jane Smith",
    });

    console.log("Database seeded successfully!");
  }
};

seedData();

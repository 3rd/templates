import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

// https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/sqlite-core/README.md

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email"),
  password: text("password"),
});

export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

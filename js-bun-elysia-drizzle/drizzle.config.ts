import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/*",
  out: "./migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
} satisfies Config;

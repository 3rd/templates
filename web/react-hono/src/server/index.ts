import { migrate } from "./db/migrations";
import { createSqliteDatabase } from "./db/sqlite";
import { env } from "./env";
import { createApp } from "./app";

const main = async () => {
  const db = await createSqliteDatabase(env.DATABASE_PATH);
  migrate(db);
  const app = createApp({ db, env });

  if (typeof Bun !== "undefined") {
    Bun.serve({
      fetch: app.fetch,
      hostname: env.HOST,
      port: env.PORT,
    });
  } else {
    const { serve } = await import("@hono/node-server");
    serve({
      fetch: app.fetch,
      hostname: env.HOST,
      port: env.PORT,
    });
  }

  console.log(`Server listening on http://${env.HOST}:${env.PORT}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

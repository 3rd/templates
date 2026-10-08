import { env } from "./env";
import { createApp } from "./app";
import { createPocketBaseGateway } from "./pocketbase/gateway";

const main = async () => {
  const app = createApp({
    env,
    pocketbase: createPocketBaseGateway(env.POCKETBASE_URL),
  });

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

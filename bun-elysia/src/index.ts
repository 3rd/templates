import { app } from "./app";
import { env } from "./utils/env";

app.listen(env.PORT, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${env.PORT}`);
});

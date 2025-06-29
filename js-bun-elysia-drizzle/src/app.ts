import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { exampleController } from "./controllers/example-controller";
import { env } from "./utils/env";
import { packageJSON } from "./utils/package";

const app = new Elysia();

if (env.IS_DEV) {
  app.use(
    swagger({
      documentation: {
        info: {
          title: packageJSON.name,
          version: packageJSON.version,
        },
      },
    }),
  );
}

app.use(exampleController);

app.onError(({ code }) => {
  if (code === "NOT_FOUND") return "Route not found :(";
});

export type App = typeof app;
export { app };

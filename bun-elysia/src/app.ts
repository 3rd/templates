import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { env } from "./utils/env";
import { packageJSON } from "./utils/package";
import { exampleController } from "./controllers/exampleController";

const app = new Elysia();

if (env.IS_DEV) {
  app.use(
    swagger({
      documentation: {
        info: {
          title: packageJSON.name,
          version: packageJSON.version,
          description: packageJSON.description,
        },
      },
    })
  );
}

app.use(exampleController);

app.onError(({ code }) => {
  if (code === "NOT_FOUND") return "Route not found :(";
});

export type App = typeof app;
export { app };

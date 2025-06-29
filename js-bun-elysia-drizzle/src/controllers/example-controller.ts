import Elysia, { t } from "elysia";

export const exampleController = new Elysia({ prefix: "/example" })
  .get("/", () => "Hello World!")
  .get("/id/:id", ({ params: { id } }) => id, {
    params: t.Object({
      id: t.Numeric(),
    }),
  });

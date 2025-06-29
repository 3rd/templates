import packageJson from "./package.json";
import { createServer } from "./packages/backend";

createServer({
  version: packageJson.version,
  port: process.env.PORT ?? 3000,
});

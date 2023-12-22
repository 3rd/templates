import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJSONPath = resolve(__dirname, "../../package.json");

const file = Bun.file(packageJSONPath);
const contents = await file.json<{ name: string; version: string; description?: string }>();

export const packageJSON = {
  name: contents.name,
  version: contents.version,
  description: contents.description ?? "",
};

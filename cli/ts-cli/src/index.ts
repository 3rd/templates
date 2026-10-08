#!/usr/bin/env node

import { existsSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { main } from "./cli";
import { handleCliError } from "./errors";

const isMainModule = Boolean(
  process.argv[1] &&
    existsSync(process.argv[1]) &&
    import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
);
if (isMainModule) {
  main().catch(handleCliError);
}

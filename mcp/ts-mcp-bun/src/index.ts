#!/usr/bin/env bun

import { handleServerError } from "./errors";
import { startServer } from "./server/start-server";

if (import.meta.main) {
  startServer().catch(handleServerError);
}

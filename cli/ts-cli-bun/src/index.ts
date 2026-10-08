#!/usr/bin/env bun

import { main } from "./cli";
import { handleCliError } from "./errors";

if (import.meta.main) {
  main().catch(handleCliError);
}

#!/usr/bin/env bun

import { cli as cleye } from "cleye";
import packageJson from "../package.json";
import { testCommand } from "./commands/test";

const argv = cleye({
  name: packageJson.name,
  version: packageJson.version,
  commands: [testCommand],
});

if (!argv.command) {
  argv.showHelp();
}

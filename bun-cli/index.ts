#!/usr/bin/env bun
import { cli as cleye, command } from "cleye";
import chalk from "chalk";
import packageJson from "./package.json";
import { handleTest } from "./cmd/test";

const main = async () => {
  const argv = cleye({
    name: packageJson.name,
    version: packageJson.version,
    commands: [
      command({
        name: "test",
        help: {
          description: "Test command",
          usage: `${packageJson.name} test <target...> --opt [value]`,
        },
        parameters: ["<target...>"],
        flags: {
          opt: {
            type: String,
            alias: "o",
            default: "",
            description: "The option to use",
          },
        },
      }),
    ],
  });

  console.log(chalk.green(`${packageJson.name} v${packageJson.version}`));

  if (argv.command === "test") {
    handleTest(argv._.target, argv.flags.opt);
  }

  if (!argv.command) {
    argv.showHelp();
  }
};

main();

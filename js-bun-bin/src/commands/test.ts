import chalk from "chalk";
import { command } from "cleye";
import packageJson from "../../package.json";

export const handleTest = async (targets: string[] = [], opt = "") => {
  if (targets.length === 0) {
    console.error(chalk.red("Error: No targets specified"));
    console.log(chalk.gray("Usage: cli test <target...> [--opt value]"));
    process.exit(1);
  }

  if (opt) {
    console.log(chalk.gray(`Option: ${opt}`));
  }

  for (const target of targets) {
    console.log(chalk.blue(`📁 Processing: ${target}`));
    await Bun.sleep(100);
    console.log(chalk.green(`✅ Completed: ${target}`));
  }

  console.log(chalk.green(`\n✨ All ${targets.length} target(s) processed successfully`));
};

export const testCommand = command(
  {
    name: "test",
    help: {
      description: "Test command example",
      usage: `${packageJson.name} test <target...> --opt [value]`,
      examples: [
        `${packageJson.name} test file1.ts file2.ts`,
        `${packageJson.name} test src/*.ts --opt debug`,
      ],
    },
    parameters: ["<target...>"],
    flags: {
      opt: {
        type: String,
        alias: "o",
        default: "",
        description: "Optional parameter",
      },
    },
  },
  async (parsedArgs) => {
    console.log(chalk.green(`🚀 Running ${packageJson.name} test command`));
    await handleTest(parsedArgs._.target, parsedArgs.flags.opt);
  },
);

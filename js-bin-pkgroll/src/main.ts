import chalk from "chalk";
import { cli as cleye } from "cleye";
import packageJson from "../package.json";

const main = async () => {
  const argv = cleye({
    name: "app",
    version: packageJson.version,
    parameters: ["<param>", "<rest...>"],
  });

  const args = [argv._.param, ...argv._.rest];
  const afterSeparator = argv._["--"];
  if (afterSeparator.length > 0) {
    args.splice(args.length - afterSeparator.length, 0, "--");
  }

  console.log(chalk.green(JSON.stringify(args, null, 2)));
};

main();

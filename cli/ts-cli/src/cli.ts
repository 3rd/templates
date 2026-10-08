import cli from "gunsmith";
import { registerGreetCommand } from "./commands/greet";

export const CLI_NAME = "app";
export const CLI_VERSION = "0.0.0";

export const createCli = () =>
  registerGreetCommand(
    cli.create(CLI_NAME, {
      version: CLI_VERSION,
      description: "A starter TypeScript CLI.",
      features: {
        mcp: false,
        schema: false,
        llms: false,
      },
    })
  );

export const main = async (argv = process.argv.slice(2)): Promise<void> => {
  await createCli().serve(argv);
};

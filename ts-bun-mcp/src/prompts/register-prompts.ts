import type { FastMCP } from "fastmcp";
import { trimLines } from "@/utils/trim-lines";

export const registerPrompts = (server: FastMCP) => {
  server.addPrompt({
    name: "git-commit",
    description: "Draft a concise Git commit message from a summary of changes.",
    arguments: [
      {
        description: "Git diff or summary of the changes.",
        name: "changes",
        required: true,
      },
    ],
    load: async ({ changes }) => {
      return trimLines(`
        Write a concise, descriptive Git commit message for the following changes:
        ${changes}
      `);
    },
  });
};

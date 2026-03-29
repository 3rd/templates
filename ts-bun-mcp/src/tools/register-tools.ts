import type { FastMCP } from "fastmcp";
import { registerAddTool } from "@/tools/add/add";

export const registerTools = (server: FastMCP) => {
  registerAddTool(server);
};

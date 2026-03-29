import { FastMCP } from "fastmcp";
import { SERVER_METADATA } from "@/constants";
import { registerPrompts } from "@/prompts/register-prompts";
import { registerResources } from "@/resources/register-resources";
import { registerTools } from "@/tools/register-tools";

export const createServer = (): FastMCP => {
  const server = new FastMCP(SERVER_METADATA);

  registerTools(server);
  registerResources(server, SERVER_METADATA);
  registerPrompts(server);

  return server;
};

import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "#mcp/client/stdio";

const [command, ...args] = process.argv.slice(2);

if (!command) throw new Error("usage: bun scripts/smoke.mjs <command> [...args]");

const client = new Client({
  name: "ts-mcp-bun-smoke",
  version: "0.0.0",
});

const transport = new StdioClientTransport({
  command,
  args,
  cwd: process.cwd(),
  stderr: "pipe",
});

try {
  await client.connect(transport);

  const tools = await client.listTools();
  assert.ok(tools.tools.some((tool) => tool.name === "add"));

  const addResult = await client.callTool({
    name: "add",
    arguments: { a: 2, b: 3 },
  });
  const addText = addResult.content.find((content) => content.type === "text")?.text;
  assert.equal(addText, "5");

  const invalidResult = await client.callTool({
    name: "add",
    arguments: { a: "not-a-number", b: 3 },
  });
  assert.equal(invalidResult.isError, true);

  const resources = await client.listResources();
  assert.ok(resources.resources.some((resource) => resource.uri === "template://server-info"));

  const serverInfo = await client.readResource({ uri: "template://server-info" });
  const serverInfoText = serverInfo.contents.find((content) => "text" in content)?.text;
  assert.ok(serverInfoText?.includes('"name": "ts-mcp-bun"'));

  const prompts = await client.listPrompts();
  assert.ok(prompts.prompts.some((prompt) => prompt.name === "summarize"));

  const prompt = await client.getPrompt({
    name: "summarize",
    arguments: { topic: "Bun MCP templates" },
  });
  const promptText = prompt.messages[0]?.content.type === "text" ? prompt.messages[0].content.text : "";
  assert.ok(promptText.includes("Bun MCP templates"));
} finally {
  await client.close();
}

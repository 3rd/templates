import { expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "#mcp/in-memory";
import { createServer } from "../server/create-server";

test.each([
  [{ name: "summarize" }, "this project"],
  [{ name: "summarize", arguments: {} }, "this project"],
  [{ name: "summarize", arguments: { topic: "  MCP templates  " } }, "MCP templates"],
] as const)("gets the prompt through the protocol: %j", async (params, topic) => {
  const server = createServer();
  const client = new Client({ name: "prompt-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  try {
    await client.connect(clientTransport);
    const result = await client.getPrompt(params);
    expect(result.messages).toEqual([
      {
        role: "user",
        content: { type: "text", text: `Summarize ${topic} in three concise bullet points.` },
      },
    ]);
  } finally {
    await client.close();
    await server.close();
  }
});

test("lists optional prompt metadata and rejects unknown names and blank topics", async () => {
  const server = createServer();
  const client = new Client({ name: "prompt-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  try {
    await client.connect(clientTransport);
    expect(client.getServerCapabilities()).toMatchObject({ prompts: { listChanged: true } });
    expect(await client.listPrompts()).toEqual({
      prompts: [{
        name: "summarize",
        title: "Summarize",
        description: "Create a short summary prompt for a topic.",
        arguments: [{ name: "topic", description: "Topic to summarize", required: false }],
      }],
    });
    await expect(client.getPrompt({ name: "missing" })).rejects.toMatchObject({ code: -32602 });
    await expect(client.getPrompt({ name: "summarize", arguments: { topic: " " } })).rejects.toMatchObject({ code: -32602 });
  } finally {
    await client.close();
    await server.close();
  }
});

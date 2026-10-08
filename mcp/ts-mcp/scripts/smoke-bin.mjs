import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const entry = resolve("dist/index.js");
const output = execFileSync(process.execPath, [
  "--input-type=module",
  "--eval",
  `await import(${JSON.stringify(pathToFileURL(entry).href)}); console.log("imported");`,
  "not-an-entrypoint",
], {
  encoding: "utf8",
  input: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "import-test", version: "1.0.0" },
    },
  }) + "\n",
});
assert.equal(output, "imported\n");

if (process.platform !== "win32") {
  const directory = await mkdtemp(join(tmpdir(), "ts-mcp-bin-"));

  try {
    const executable = join(directory, "mcp-server");
    await symlink(entry, executable);
    execFileSync(process.execPath, ["scripts/smoke.mjs", executable], { stdio: "inherit" });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

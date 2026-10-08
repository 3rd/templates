import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const executable = process.argv[2] ?? "dist/index.js";

const runCli = async (...args) => {
  const result = await execFileAsync(executable, args);
  assert.equal(result.stderr, "");
  return result.stdout;
};

assert.equal(await runCli("greet", "Ada"), "hello Ada\n");
assert.equal(await runCli("greet", "Ada", "--excited"), "hello Ada!\n");
assert.equal(await runCli("greet", "Ada", "-e"), "hello Ada!\n");

const jsonOutput = await runCli("greet", "Ada", "--json");
assert.deepEqual(JSON.parse(jsonOutput), { message: "hello Ada" });

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const runCli = async (...args) => {
  const result = await execFileAsync(process.execPath, ["dist/index.js", ...args]);
  assert.equal(result.stderr, "");
  return result.stdout;
};

assert.equal(await runCli("greet", "Ada"), "hello Ada\n");
assert.equal(await runCli("greet", "Ada", "--excited"), "hello Ada!\n");
assert.equal(await runCli("greet", "Ada", "-e"), "hello Ada!\n");

const jsonOutput = await runCli("greet", "Ada", "--json");
assert.deepEqual(JSON.parse(jsonOutput), { message: "hello Ada" });

const imported = await execFileAsync(process.execPath, [
  "--input-type=module",
  "--eval",
  'await import("./dist/index.js")',
  "import-only",
]);
assert.equal(imported.stdout, "");
assert.equal(imported.stderr, "");

if (process.platform !== "win32") {
  const binDirectory = await mkdtemp(join(tmpdir(), "ts-cli-bin-"));

  try {
    const binPath = join(binDirectory, "app");
    await symlink(resolve("dist/index.js"), binPath);

    const result = await execFileAsync(binPath, ["greet", "Ada"], {
      env: {
        ...process.env,
        PATH: `${dirname(process.execPath)}${delimiter}${process.env.PATH ?? ""}`,
      },
    });
    assert.equal(result.stderr, "");
    assert.equal(result.stdout, "hello Ada\n");
  } finally {
    await rm(binDirectory, { recursive: true, force: true });
  }
}

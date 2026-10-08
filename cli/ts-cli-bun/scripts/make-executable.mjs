import { chmod, readFile, writeFile } from "node:fs/promises";

const outputFile = "dist/index.js";
const bunShebang = "#!/usr/bin/env bun\n";
const output = await readFile(outputFile, "utf8");

if (!output.startsWith("#!")) await writeFile(outputFile, `${bunShebang}${output}`);

await chmod(outputFile, 0o755);

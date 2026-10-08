import { chmod, readFile, writeFile } from "node:fs/promises";

const outputFile = "dist/index.js";
const nodeShebang = "#!/usr/bin/env node\n";
const output = await readFile(outputFile, "utf8");

if (!output.startsWith("#!")) await writeFile(outputFile, `${nodeShebang}${output}`);

await chmod(outputFile, 0o755);

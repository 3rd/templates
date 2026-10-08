import { mkdir, rm } from "node:fs/promises";

const binaryOutputs = [
  "dist/app",
  "dist/app.exe",
  "dist/app-linux-x64",
  "dist/app-linux-arm64",
  "dist/app-darwin-x64",
  "dist/app-darwin-arm64",
  "dist/app-windows-x64.exe",
];

await mkdir("dist", { recursive: true });
await Promise.all(binaryOutputs.map((output) => rm(output, { force: true })));

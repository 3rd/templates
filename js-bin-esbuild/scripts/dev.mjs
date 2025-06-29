import path from "node:path";
import { spawn } from "node:child_process";
import * as esbuild from "esbuild";

const __dirname = path.join(path.dirname(decodeURI(new URL(import.meta.url).pathname))).replace(/^\\([A-Z]:\\)/, "$1");

/** @type {ChildProcessWithoutNullStreams | null}*/
let child = null;

const run = () => {
  const command = "node";
  const args = [path.resolve(__dirname, "../dist/main.mjs")];
  if (child) {
    child.stdin.end();
    child.kill();
  }
  child = spawn(command, args);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  // child.stdout.on("data", (data) => console.log(data.toString()));
  // child.stderr.on("data", (data) => console.error(data.toString()));
  child.on("close", (code) => {
    if (code !== 0) console.log(`[watch] exit: ${code}\n`);
  });
};

/** @param {{
  config: esbuild.BuildOptions,
}} options*/
export const dev = async (options) => {
  const ctx = await esbuild.context({
    ...options.config,
    plugins: [
      {
        name: "watch",
        setup(build) {
          build.onEnd(async (result) => {
            if (result.metafile) {
              console.log(await esbuild.analyzeMetafile(result.metafile, { verbose: false }));
            }
            run();
          });
        },
      },
    ],
  });
  return ctx.watch();
};

import * as esbuild from "esbuild";
import { dev } from "./dev.mjs";
import { build } from "./build.mjs";

const banner = `
  import { fileURLToPath } from 'url';
  import { createRequire as topLevelCreateRequire } from 'module';
  const require = topLevelCreateRequire(import.meta.url);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = require("path").dirname(__filename);
`;

/** @type Record<string,esbuild.BuildOptions>*/
const config = {
  base: {
    bundle: true,
    platform: "node",
    format: "esm",
    target: ["node20.10"],
    entryPoints: ["src/main.ts"],
    outfile: "dist/main.mjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    // packages: "external",
  },
  dev: {
    sourcemap: true,
    color: true,
    logLevel: "info",
    define: {
      "process.env.NODE_ENV": '"development"',
    },
    banner: { js: banner },
  },
  build: {
    metafile: true,
    minify: true,
    banner: { js: banner },
  },
};

const command = process.argv[2];
if (!command) {
  console.log("No command specified.");
  process.exit(1);
}

switch (command) {
  case "dev": {
    await dev({ config: { ...config.base, ...config.dev } });
    break;
  }
  case "build": {
    await build({ config: { ...config.base, ...config.build } });
    break;
  }
  default: {
    console.log(`Unknown command: ${command}`);
    break;
  }
}

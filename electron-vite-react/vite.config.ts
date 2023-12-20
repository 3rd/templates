import react from "@vitejs/plugin-react";
import { UserConfig, ConfigEnv } from "vite";
import { join } from "path";

const sourceDir = join(__dirname, "src/frontend");
const distDir = join(__dirname, "dist");

export default ({ command }: ConfigEnv): UserConfig => {
  if (command === "serve") {
    return {
      root: sourceDir,
      base: "/",
      plugins: [react()],
      resolve: {
        alias: {
          "/@": sourceDir,
        },
      },
      build: {
        outDir: distDir,
        emptyOutDir: true,
        rollupOptions: {},
      },
      server: {
        port: process.env.PORT === undefined ? 3000 : Number(process.env.PORT),
      },
      optimizeDeps: {
        exclude: ["path"],
      },
    };
  }

  return {
    root: sourceDir,
    base: "./",
    plugins: [react()],
    resolve: {
      alias: {
        "/@": sourceDir,
      },
    },
    build: {
      outDir: distDir,
      emptyOutDir: true,
      rollupOptions: {},
    },
    server: {
      port: process.env.PORT === undefined ? 3000 : Number(process.env.PORT),
    },
    optimizeDeps: {
      exclude: ["path"],
    },
  };
};

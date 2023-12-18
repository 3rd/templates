/// <reference types="vitest" />
// https://vitejs.dev/config/
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [visualizer()],
  test: {},
  build: {
    rollupOptions: {
      output: {
        manualChunks: {},
      },
      external: [],
    },
  },
  resolve: {
    alias: {},
  },
});

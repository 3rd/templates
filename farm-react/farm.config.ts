import type { UserConfig } from "@farmfe/core";
import postcss from "@farmfe/js-plugin-postcss";

function defineConfig(config: UserConfig) {
  return config;
}

export default defineConfig({
  plugins: ["@farmfe/plugin-react", postcss()],
});

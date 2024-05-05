/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: [
    //
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    //
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@modern-js/storybook",
    options: {
      bundler: "rspack",
    },
  },
  docs: {
    autodocs: "tag",
  },
  typescript: {
    reactDocgen: "react-docgen",
  },
};
export default config;

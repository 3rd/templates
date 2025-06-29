const config = {
  stories: [
    //
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [],
  framework: "storybook-react-rsbuild",
  rsbuildFinal: (config: unknown) => {
    return config;
  },
  docs: {
    autodocs: "tag",
  },
  typescript: {
    reactDocgen: "react-docgen",
  },
};

export default config;

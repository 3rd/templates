import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";
import { pluginImageCompress } from "@rsbuild/plugin-image-compress";

export default defineConfig({
  plugins: [
    //
    pluginReact(),
    pluginTypeCheck(),
    pluginImageCompress(),
  ],
  html: {
    title: "App",
    meta: {
      description: "Description",
    },
    // favicon: "favicon.png",
    // tags: [
    //   { tag: "script", attrs: { src: "a.js" } },
    //   { tag: "script", attrs: { src: "b.js" }, append: false },
    //   { tag: "link", attrs: { href: "style.css", rel: "stylesheet" }, append: true },
    //   { tag: "link", attrs: { href: "page.css", rel: "stylesheet" }, publicPath: false },
    //   { tag: "script", attrs: { src: "c.js" }, head: false },
    //   { tag: "meta", attrs: { name: "referrer", content: "origin" } },
    // ],
  },
});

import { writeFileSync } from "node:fs";
import * as esbuild from "esbuild";

/** @param {{
  config: esbuild.BuildOptions,
}} options*/
export const build = async (options) => {
  const result = await esbuild.build(options.config);
  if (result.metafile) {
    console.log(
      await esbuild.analyzeMetafile(result.metafile, {
        verbose: false,
      })
    );
    writeFileSync("build-meta.json", JSON.stringify(result.metafile));
    console.log("Wrote build-meta.json, you can upload it to: https://esbuild.github.io/analyze");
  }
};

import esmShim from "@rollup/plugin-esm-shim";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].mjs",
    sourcemap: true,
  },
  plugins: [esmShim(), typescript()],
};

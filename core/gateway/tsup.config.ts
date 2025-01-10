import { defineConfig } from "tsup";

import packageJson from "./package.json";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  sourcemap: true,
  splitting: true,
  clean: true,
  treeshake: true,
  minify: true,
  dts: true,
  external: ["@adaline/types", "@adaline/provider", "@adaline/tsconfig", "eslint-config-adaline"],
  define: {
    __LIBRARY_VERSION__: JSON.stringify(packageJson.version),
  },
});

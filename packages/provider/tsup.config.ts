import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  sourcemap: true,
  splitting: true,
  clean: true,
  treeshake: true,
  minify: true,
  dts: true,
  external: ["@adaline/types", "@adaline/tsconfig", "eslint-config-adaline"],
});

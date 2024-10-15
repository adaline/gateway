import type { Config } from "@jest/types";

import baseConfig from "../../../jest.config.base";

const config: Config.InitialOptions = {
  ...baseConfig,
  rootDir: "./",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
};

export default config;

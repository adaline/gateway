// TODO: test if this file is isomorphic
import { readFileSync } from "fs";
import os from "os";
import { join } from "path";

import { AnalyticsBrowserEnvironment, AnalyticsNodeEnvironment } from "./analytics.interface";

// const isGatewayAnalyticsEnabled = (): boolean => {
//   return process.env.ADX_ANALYTICS_ENABLED === "true" || process.env.ADX_ANALYTICS_ENABLED === undefined;
// }

const getGatewayEnvironment = (): string => {
  return process.env.ADX_NODE_ENV || "unknown";
};

const getNodeDetails = (): AnalyticsNodeEnvironment => {
  return {
    node: {
      version: process.version,
      platform: os.platform(),
      architecture: os.arch(),
    },
  };
};

const getBrowserDetails = (): AnalyticsBrowserEnvironment => {
  return {
    browser: {
      version: navigator.userAgent,
      userAgent: navigator.userAgent,
    },
  };
};

const getGatewayVersion = (): string => {
  try {
    const packageJsonPath = join(__dirname, "../package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    return packageJson.version;
  } catch {
    return "unknown";
  }
};

export { getGatewayEnvironment, getNodeDetails, getBrowserDetails, getGatewayVersion };

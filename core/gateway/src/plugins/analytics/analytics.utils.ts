import os from "os";

import { AnalyticsBrowserEnvironment, AnalyticsNodeEnvironment } from "./analytics.interface";

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

export { getBrowserDetails, getGatewayEnvironment, getNodeDetails };

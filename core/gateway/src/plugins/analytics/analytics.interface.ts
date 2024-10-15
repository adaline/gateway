type AnalyticsNodeEnvironment = {
  node: {
    version: string;
    platform: string;
    architecture: string;
  };
};

type AnalyticsBrowserEnvironment = {
  browser: {
    version: string;
    userAgent: string;
  };
};

type AnalyticsEvent = {
  event: string;
  timestamp: string;
  dimensions: { [key: string]: any };
  status: string;
  eventVersion: string;
  gatewayVersion: string;
  environment: AnalyticsNodeEnvironment | AnalyticsBrowserEnvironment;
  userId?: string;
};

interface AnalyticsRecorder {
  record(event: AnalyticsEvent["event"], status: AnalyticsEvent["status"], dimensions: AnalyticsEvent["dimensions"]): void;
  stopRecorder(): void;
}

export { type AnalyticsEvent, type AnalyticsNodeEnvironment, type AnalyticsBrowserEnvironment, type AnalyticsRecorder };

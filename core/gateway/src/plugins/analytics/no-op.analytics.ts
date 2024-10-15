import { AnalyticsEvent, AnalyticsRecorder } from "./analytics.interface";

class NoOpAnalytics implements AnalyticsRecorder {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  record(event: AnalyticsEvent["event"], status: AnalyticsEvent["status"], dimensions: AnalyticsEvent["dimensions"]): void {
    // Do nothing
  }

  stopRecorder(): void {
    // Do nothing
  }
}

export { NoOpAnalytics };

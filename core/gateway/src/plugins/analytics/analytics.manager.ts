import { AnalyticsRecorder } from "./analytics.interface";
import { NoOpAnalytics } from "./no-op.analytics";
import { PostAnalytics } from "./post.analytics";

class AnalyticsManager {
  private static analytics: AnalyticsRecorder | undefined;

  static getAnalyticsRecorder(analyticsEnabled: boolean): AnalyticsRecorder {
    if (this.analytics !== undefined) {
      return this.analytics;
    } else {
      this.analytics = analyticsEnabled ? new PostAnalytics() : new NoOpAnalytics();
      return this.analytics;
    }
  }
}

export { AnalyticsManager };

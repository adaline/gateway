import axios from "axios";

import { isRunningInBrowser } from "./../../utils";
import { AnalyticsBrowserEnvironment, AnalyticsEvent, AnalyticsNodeEnvironment, AnalyticsRecorder } from "./analytics.interface";
import { getBrowserDetails, getGatewayVersion, getNodeDetails } from "./analytics.utils";

class PostAnalytics implements AnalyticsRecorder {
  private readonly eventVersion = "0.1";
  private readonly gatewayVersion = getGatewayVersion();

  private flushTimer: any;
  private flushInterval: number = 10000;
  private batchSize: number = 1;
  private maxAttempts: number = 3;
  private environment: AnalyticsNodeEnvironment | AnalyticsBrowserEnvironment = isRunningInBrowser()
    ? getBrowserDetails()
    : getNodeDetails();
  private analyticsEndpointUrl: string = "https://j954t34pkh.execute-api.us-east-1.amazonaws.com/v0/analytics";

  private events: { event: AnalyticsEvent; attempt: number }[] = [];

  constructor() {
    // this.startFlushTimer();
  }

  private startFlushTimer() {
    if (isRunningInBrowser()) {
      this.flushTimer = window.setInterval(() => this.flushEvents(), this.flushInterval);
    } else {
      this.flushTimer = setInterval(() => this.flushEvents(), this.flushInterval);
    }
  }

  private stopFlushTimer() {
    if (isRunningInBrowser()) {
      window.clearInterval(this.flushTimer);
    } else {
      clearInterval(this.flushTimer);
    }
  }

  record(event: AnalyticsEvent["event"], status: AnalyticsEvent["status"], dimensions: AnalyticsEvent["dimensions"]): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      status,
      dimensions,
      timestamp: new Date().toISOString(),
      eventVersion: this.eventVersion,
      gatewayVersion: this.gatewayVersion,
      environment: this.environment,
    };
    this.events.push({ event: analyticsEvent, attempt: 0 });

    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    const success = await this.sendEvents(eventsToSend.map((e) => e.event));
    if (!success) {
      this.events.push(
        ...eventsToSend.filter((e) => e.attempt < this.maxAttempts).map((e) => ({ event: e.event, attempt: e.attempt + 1 }))
      );
    }
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<boolean> {
    try {
      const response = await axios.post(
        this.analyticsEndpointUrl,
        { events },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  public stopRecorder() {
    this.stopFlushTimer();
    this.flushEvents();
  }
}

export { PostAnalytics };

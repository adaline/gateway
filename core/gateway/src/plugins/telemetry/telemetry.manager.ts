import { Meter, metrics, trace, Tracer } from "@opentelemetry/api";

class TelemetryManager {
  static DEFAULT_TRACER_KEY = "gateway";
  static DEFAULT_METER_KEY = "gateway";

  private static tracer: Tracer | undefined = undefined;
  private static meter: Meter | undefined = undefined;

  static setTracer(tracer: Tracer | undefined): void {
    if (!this.tracer) {
      this.tracer = tracer || trace.getTracer(this.DEFAULT_TRACER_KEY);
    }
  }

  static getTracer(): Tracer {
    return this.tracer || trace.getTracer(this.DEFAULT_TRACER_KEY);
  }

  static setMeter(meter: Meter | undefined): void {
    if (!this.meter) {
      this.meter = meter || metrics.getMeter(this.DEFAULT_METER_KEY);
    }
  }

  static getMeter(): Meter {
    return this.meter || metrics.getMeter(this.DEFAULT_METER_KEY);
  }
}

export { TelemetryManager };

import {
  SpanExporter,
  ReadableSpan,
  ExportResult,
  ExportResultCode,
} from '@opentelemetry/sdk-trace-base';
import { hrTimeToMilliseconds } from '@opentelemetry/core';

export interface AdalineTraceExporterOptions {
  apiKey: string;        // Your Adaline Workspace API Key
  projectId: string;     // Your Adaline Project ID
  endpoint?: string;     // Optional custom endpoint
  sessionId?: string;    // Optional session ID to group traces
  tags?: string[];       // Optional tags for all traces
  timeout?: number;      // Optional timeout in ms (default: 10000)
  debug?: boolean;       // Enable debug logging (default: false)
}

interface AdalineTrace {
  projectId: string;
  trace: {
    startedAt: number;
    endedAt?: number;
    name: string;
    status: 'success' | 'failure' | 'pending' | 'unknown';
    referenceId?: string;
    sessionId?: string;
    attributes?: Record<string, string | number | boolean>;
    tags?: string[];
  };
  spans?: AdalineSpan[];
}

interface AdalineSpan {
  startedAt: number;
  endedAt: number;
  name: string;
  status: 'success' | 'failure' | 'pending' | 'unknown';
  content: Record<string, any>;
  referenceId?: string;
  parentReferenceId?: string;
  sessionId?: string;
  attributes?: Record<string, string | number | boolean>;
  tags?: string[];
}

/**
 * OpenTelemetry SpanExporter that sends trace data to Adaline Trace
 *
 * @example
 * ```typescript
 * import { AdalineTraceExporter } from '@adaline/gateway';
 *
 * const exporter = new AdalineTraceExporter({
 *   apiKey: process.env.ADALINE_API_KEY,
 *   projectId: process.env.ADALINE_PROJECT_ID,
 * });
 * ```
 */
export class AdalineTraceExporter implements SpanExporter {
  private readonly apiKey: string;
  private readonly projectId: string;
  private readonly endpoint: string;
  private readonly sessionId?: string;
  private readonly tags?: string[];
  private readonly timeout: number;
  private readonly debug: boolean;

  constructor(options: AdalineTraceExporterOptions) {
    this.apiKey = options.apiKey;
    this.projectId = options.projectId;
    this.endpoint = options.endpoint || 'https://api.adaline.ai/v2/api/logs/trace';
    this.sessionId = options.sessionId;
    this.tags = options.tags;
    this.timeout = options.timeout || 10000;
    this.debug = options.debug || false;

    if (this.debug) {
      console.log('[AdalineTraceExporter] Initialized with endpoint:', this.endpoint);
    }
  }

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): Promise<void> {
    if (spans.length === 0) {
      resultCallback({ code: ExportResultCode.SUCCESS });
      return;
    }

    try {
      // Group spans by trace ID
      const traceGroups = this.groupSpansByTrace(spans);

      // Send each trace group to Adaline
      const promises = Array.from(traceGroups.entries()).map(([traceId, traceSpans]) =>
        this.sendTrace(traceId, traceSpans)
      );

      await Promise.all(promises);

      if (this.debug) {
        console.log(`[AdalineTraceExporter] Successfully exported ${spans.length} spans in ${traceGroups.size} traces`);
      }

      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      if (this.debug) {
        console.error('[AdalineTraceExporter] Export failed:', error);
      }
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async shutdown(): Promise<void> {
    if (this.debug) {
      console.log('[AdalineTraceExporter] Shutting down');
    }
  }

  async forceFlush(): Promise<void> {
    // BatchSpanProcessor handles batching
  }

  private groupSpansByTrace(spans: ReadableSpan[]): Map<string, ReadableSpan[]> {
    const groups = new Map<string, ReadableSpan[]>();
    for (const span of spans) {
      const traceId = span.spanContext().traceId;
      const existing = groups.get(traceId) || [];
      existing.push(span);
      groups.set(traceId, existing);
    }
    return groups;
  }

  private async sendTrace(traceId: string, spans: ReadableSpan[]): Promise<void> {
    // Find the root span (no parent) to use as the trace
    const rootSpan = spans.find(s => !s.parentSpanId) || spans[0];

    // Convert spans to Adaline format
    const adalineSpans = spans.map(span => this.convertSpan(span));

    // Build the trace object
    const trace: AdalineTrace = {
      projectId: this.projectId,
      trace: {
        startedAt: hrTimeToMilliseconds(rootSpan.startTime),
        endedAt: hrTimeToMilliseconds(rootSpan.endTime),
        name: rootSpan.name,
        status: this.convertStatus(rootSpan.status.code),
        referenceId: traceId,
        sessionId: this.sessionId || this.extractSessionId(rootSpan),
        attributes: this.convertAttributes(rootSpan.attributes),
        tags: this.tags || this.extractTags(rootSpan),
      },
      spans: adalineSpans.length > 1 ? adalineSpans : undefined,
    };

    // Send to Adaline Trace API
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trace),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Adaline Trace API error (${response.status}): ${errorData.message || response.statusText}`
      );
    }

    if (this.debug) {
      const data = await response.json();
      console.log(`[AdalineTraceExporter] Trace sent successfully:`, {
        traceId: data.traceId,
        spanIds: data.spanIds,
      });
    }
  }

  private convertSpan(span: ReadableSpan): AdalineSpan {
    return {
      startedAt: hrTimeToMilliseconds(span.startTime),
      endedAt: hrTimeToMilliseconds(span.endTime),
      name: span.name,
      status: this.convertStatus(span.status.code),
      content: {
        kind: span.kind,
        attributes: span.attributes,
        events: span.events,
        links: span.links,
        resource: span.resource.attributes,
      },
      referenceId: span.spanContext().spanId,
      parentReferenceId: span.parentSpanId || undefined,
      sessionId: this.sessionId || this.extractSessionId(span),
      attributes: this.convertAttributes(span.attributes),
      tags: this.tags || this.extractTags(span),
    };
  }

  private convertStatus(statusCode: number): 'success' | 'failure' | 'pending' | 'unknown' {
    // OpenTelemetry status codes: UNSET = 0, OK = 1, ERROR = 2
    switch (statusCode) {
      case 1: return 'success';
      case 2: return 'failure';
      case 0:
      default: return 'unknown';
    }
  }

  private convertAttributes(
    attributes: Record<string, any>
  ): Record<string, string | number | boolean> {
    const converted: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        converted[key] = value;
      } else if (value !== null && value !== undefined) {
        converted[key] = JSON.stringify(value);
      }
    }
    return converted;
  }

  private extractSessionId(span: ReadableSpan): string | undefined {
    return (
      span.attributes['sessionId'] as string ||
      span.attributes['session.id'] as string ||
      span.attributes['chat.session_id'] as string
    );
  }

  private extractTags(span: ReadableSpan): string[] | undefined {
    const tags = span.attributes['tags'];
    if (Array.isArray(tags)) {
      return tags.map(t => String(t));
    }
    return undefined;
  }
}

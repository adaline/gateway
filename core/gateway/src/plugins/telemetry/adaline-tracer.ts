import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Tracer, Span } from '@opentelemetry/api';
import { AdalineTraceExporter } from './adaline-trace.exporter';

export interface AdalineTracerOptions {
  apiKey: string;
  projectId: string;
  serviceName?: string;
  serviceVersion?: string;
  sessionId?: string;
  tags?: string[];
  debug?: boolean;
}

/**
 * Wrapper class for OpenTelemetry tracing with Adaline Trace
 *
 * @example
 * ```typescript
 * import { AdalineTracer } from '@adaline/gateway';
 *
 * const adalineTracer = new AdalineTracer({
 *   apiKey: process.env.ADALINE_API_KEY,
 *   projectId: process.env.ADALINE_PROJECT_ID,
 * });
 *
 * const gateway = new Gateway({
 *   telemetry: { tracer: adalineTracer.tracer }
 * });
 * ```
 */
export class AdalineTracer {
  private provider: NodeTracerProvider;
  public tracer: Tracer;

  constructor(options: AdalineTracerOptions) {
    // Create the Adaline Trace exporter
    const exporter = new AdalineTraceExporter({
      apiKey: options.apiKey,
      projectId: options.projectId,
      sessionId: options.sessionId,
      tags: options.tags,
      debug: options.debug,
    });

    // Create the tracer provider
    this.provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: options.serviceName || 'adaline-gateway-app',
        [SemanticResourceAttributes.SERVICE_VERSION]: options.serviceVersion || '1.0.0',
      }),
    });

    // Add the batch span processor with Adaline exporter
    this.provider.addSpanProcessor(new BatchSpanProcessor(exporter));

    // DO NOT call provider.register() - keeps tracing scoped to Gateway only
    // If you call provider.register(), ALL OpenTelemetry instrumentation in your app
    // will send traces to Adaline, not just Gateway calls

    // Get a tracer instance
    this.tracer = this.provider.getTracer('adaline-gateway');

    if (options.debug) {
      console.log('[AdalineTracer] Initialized (scoped to Gateway)');
    }
  }

  /**
   * Helper method to trace an AI workflow
   * Wraps the given function in a parent span
   *
   * @example
   * ```typescript
   * await adalineTracer.trace('my-workflow', async () => {
   *   const response = await gateway.completeChat({ ... });
   *   return response;
   * });
   * ```
   */
  async trace<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return this.tracer.startActiveSpan(name, async (span: Span) => {
      try {
        const result = await fn();
        span.setStatus({ code: 1 }); // Success
        return result;
      } catch (error) {
        span.setStatus({ code: 2 }); // Error
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Shutdown the tracer and flush any pending spans
   */
  async shutdown(): Promise<void> {
    await this.provider.shutdown();
  }
}

import { Context, context, Span, SpanStatusCode, trace } from "@opentelemetry/api";

import { GatewayCompleteChatRequest } from "../../gateway.types";
import { delay } from "../../utils";
import { HttpRequestError } from "./../http-client";
import { LoggerManager } from "./../logger";
import { TelemetryManager } from "./../telemetry";
import { QueueTaskTimeoutError } from "./queue.error";
import { Queue, QueueOptionsType, QueueTask } from "./queue.interface";

class SimpleQueue<Request, Response> implements Queue<Request, Response> {
  private options: QueueOptionsType;
  private activeTasks = 0;
  private queue: { task: QueueTask<Request, Response>; taskSpan: Span }[] = [];

  constructor(options: QueueOptionsType) {
    this.options = options;
  }

  public enqueue(task: QueueTask<Request, Response>): void {
    const logger = LoggerManager.getLogger();
    logger?.debug(`SimpleQueue.enqueue invoked, id: ${task.id}`);
    context.with(task.telemetryContext, async () => {
      const tracer = TelemetryManager.getTracer();
      return tracer.startActiveSpan("queue.task.pickup-wait", async (taskSpan: Span) => {
        taskSpan.setAttribute("id", task.id);
        this.queue.push({ task, taskSpan });
        logger?.debug(`SimpleQueue.enqueue task enqueued, id: ${task.id}`);
      });
    });
    this.processQueue();
  }

  private executeWithTimeout(task: QueueTask<Request, Response>, taskTelemetryContext: Context): Promise<Response> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`SimpleQueue.executeWithTimeout invoked with timeout: ${this.options.timeout}, id: ${task.id}`);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        logger?.warn(`SimpleQueue.executeWithTimeout timed out, id: ${task.id}`);
        reject(
          new QueueTaskTimeoutError({
            info: "Queue task timeout",
            cause: new Error("Queue task timeout"),
          })
        );
      }, this.options.timeout);

      logger?.debug(`SimpleQueue.executeWithTimeout task executing, id: ${task.id}`);
      task
        .execute(task.request, taskTelemetryContext)
        .then((result) => {
          logger?.debug(`SimpleQueue.executeWithTimeout task completed, id: ${task.id}`);
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          logger?.warn(`SimpleQueue.executeWithTimeout task errored, id: ${task.id}`);
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  private async executeWithRetry(task: QueueTask<Request, Response>, retryRemaining: number): Promise<Response> {
    const logger = LoggerManager.getLogger();
    return await context.with(task.telemetryContext, async () => {
      const tracer = TelemetryManager.getTracer();
      return await tracer.startActiveSpan("queue.task.execute", async (span: Span) => {
        logger?.debug(`SimpleQueue.executeWithRetry invoked, attempt: ${this.options.retryCount - retryRemaining}, id: ${task.id}`);
        span.setAttribute("attempt", this.options.retryCount - retryRemaining);
        try {
          const taskTelemetryContext = context.active();
          const response = await this.executeWithTimeout(task, taskTelemetryContext);
          span.setStatus({ code: SpanStatusCode.OK });
          span.end();
          return response;
        } catch (error) {
          if (retryRemaining === 0) {
            logger?.warn(`SimpleQueue.executeWithRetry retry count reached, id: ${task.id}`);
            // span.setStatus({ code: SpanStatusCode.ERROR });
            span.end();
            throw error;
          }

          let shouldRetry = true;
          let delayMs =
            this.options.retry.initialDelay * Math.pow(this.options.retry.exponentialFactor, this.options.retryCount - retryRemaining);
          if (HttpRequestError.isHttpRequestError(error)) {
            // rate limiting error
            if (error.cause.status === 429) {
              logger?.warn(`SimpleQueue.executeWithRetry rate limiting error, id: ${task.id}`);
              const taskRequest = GatewayCompleteChatRequest.safeParse(task.request);
              if (taskRequest.success) {
                const retryDelay = taskRequest.data.model.getRetryDelay(error.cause.headers);
                shouldRetry = retryDelay.shouldRetry;
                // valid delayMs is returned from model
                if (retryDelay.delayMs > 0) {
                  delayMs = retryDelay.delayMs;
                }
              }
            }

            if (error.cause.status >= 500 && error.cause.status < 600) {
              logger?.warn(`SimpleQueue.executeWithRetry ${error.cause.status} error, id: ${task.id}`);
              // implement retry logic for 500 errors
              // else defaults to exponential backoff
            }
          } else {
            logger?.warn(`SimpleQueue.executeWithRetry non http-request error, id: ${task.id}`, { error });
            // implement retry logic for non http-request errors
            // else defaults to exponential backoff
          }

          if (!shouldRetry) {
            // span.setStatus({ code: SpanStatusCode.ERROR });
            logger?.warn(`SimpleQueue.executeWithRetry model returned should not retry, id: ${task.id}`);
            span.end();
            throw error;
          } else {
            // span.setStatus({ code: SpanStatusCode.ERROR });
            return await tracer.startActiveSpan("queue.task.retry-wait", async (retrySpan: Span) => {
              logger?.debug(`SimpleQueue.executeWithRetry retry wait: ${delayMs}ms, id: ${task.id}`);
              await delay(delayMs);
              retrySpan.end();
              span.end();
              return this.executeWithRetry(task, retryRemaining - 1);
            });
          }
        } finally {
          // span.end();
        }
      });
    });
  }

  private async processQueue() {
    const logger = LoggerManager.getLogger();
    if (this.activeTasks >= this.options.maxConcurrentTasks) {
      logger?.debug("SimpleQueue.processQueue max concurrent tasks reached");
      return;
    }

    const item = this.queue.shift();
    if (!item) {
      logger?.debug("SimpleQueue.processQueue no item to process");
      return;
    }

    const { task, taskSpan } = item;
    if (taskSpan) {
      taskSpan.end();
    }

    this.activeTasks += 1;
    logger?.debug(`SimpleQueue.processQueue active tasks: ${this.activeTasks}`);
    logger?.debug(`SimpleQueue.processQueue processing task, id: ${task.id}`);

    try {
      const response: Response = await this.executeWithRetry(task, this.options.retryCount);
      logger?.debug(`SimpleQueue.processQueue task completed, id: ${task.id}`);
      task.resolve(response);
    } catch (error) {
      logger?.warn(`SimpleQueue.processQueue task errored, id: ${task.id}`);
      task.reject(error);
    } finally {
      this.activeTasks -= 1;
      logger?.debug(`SimpleQueue.processQueue active tasks: ${this.activeTasks}`);
      trace.getSpan(task.telemetryContext)?.end();
      this.processQueue();
    }
  }
}

export { SimpleQueue };

import { Context, context, Meter, Span, SpanStatusCode, trace, Tracer } from "@opentelemetry/api";
import { v4 as uuidv4 } from "uuid";

import { GatewayError } from "./errors";
import {
  GatewayCompleteChatRequest,
  GatewayCompleteChatRequestType,
  GatewayGetEmbeddingsRequest,
  GatewayGetEmbeddingsRequestType,
  GatewayOptions,
  GatewayOptionsType,
  GatewayStreamChatRequest,
  GatewayStreamChatRequestType,
} from "./gateway.types";
import { CompleteChatHandlerResponseType, GetEmbeddingsHandlerResponseType, StreamChatHandlerResponseType } from "./handlers";
import { handleCompleteChat } from "./handlers/complete-chat/complete-chat.handler";
import { handleGetEmbeddings } from "./handlers/get-embeddings/get-embeddings.handler";
import { handleStreamChat } from "./handlers/stream-chat/stream-chat.handler";
import { Cache, HttpClient, IsomorphicHttpClient, LRUCache, Queue, QueueTask, SimpleQueue } from "./plugins";
import { AnalyticsManager, AnalyticsRecorder } from "./plugins/analytics";
import { Logger, LoggerManager } from "./plugins/logger";
import { TelemetryManager } from "./plugins/telemetry";
import { isRunningInBrowser } from "./utils";

class Gateway {
  private options: GatewayOptionsType;

  private logger?: Logger;
  private tracer: Tracer;
  private meter: Meter;
  private analytics: AnalyticsRecorder;

  private httpClient: HttpClient;
  private queues: {
    completeChat: Queue<GatewayCompleteChatRequestType, CompleteChatHandlerResponseType>;
    getEmbeddings: Queue<GatewayGetEmbeddingsRequestType, GetEmbeddingsHandlerResponseType>;
  };
  private caches: {
    completeChat: Cache<CompleteChatHandlerResponseType>;
    getEmbeddings: Cache<GetEmbeddingsHandlerResponseType>;
  };

  constructor(options: GatewayOptionsType = {}) {
    if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
      throw new GatewayError(
        "It looks like you're running in a browser-like environment. \
        This is disabled by default, as it risks exposing your provider secrets to attackers. \
        If you understand the risks and have appropriate mitigation in place, \
        you can set the `dangerouslyAllowBrowser` option to `true`."
      );
    }

    this.options = GatewayOptions.parse(options);

    LoggerManager.setLogger(options.logger);
    this.logger = options.logger;

    this.analytics = AnalyticsManager.getAnalyticsRecorder(
      this.options.analyticsEnabled === undefined ? true : this.options.analyticsEnabled
    );

    TelemetryManager.setTracer(options.telemetry?.tracer);
    this.tracer = TelemetryManager.getTracer();

    TelemetryManager.setMeter(options.telemetry?.meter);
    this.meter = TelemetryManager.getMeter();

    const queueOptions = {
      maxConcurrentTasks: this.options.queueOptions?.maxConcurrentTasks || 4,
      retryCount: this.options.queueOptions?.retryCount || 3,
      retry: this.options.queueOptions?.retry || {
        initialDelay: 1000,
        exponentialFactor: 2,
      },
      timeout: this.options.queueOptions?.timeout || 120000,
    };

    this.queues = {
      completeChat: new SimpleQueue(queueOptions),
      getEmbeddings: new SimpleQueue(queueOptions),
    };

    // httpClient timeout is 90% of queue timeout
    this.httpClient = options.httpClient || new IsomorphicHttpClient({ timeoutInMilliseconds: queueOptions.timeout * 0.9 });

    this.caches = {
      completeChat: options.completeChatCache || new LRUCache<CompleteChatHandlerResponseType>(),
      getEmbeddings: options.getEmbeddingsCache || new LRUCache<GetEmbeddingsHandlerResponseType>(),
    };
    this.logger?.debug("gateway initialized");
  }

  async completeChat(request: GatewayCompleteChatRequestType): Promise<CompleteChatHandlerResponseType> {
    this.logger?.info("gateway.completeChat invoked");
    this.logger?.debug("request: ", { request });
    const data = GatewayCompleteChatRequest.parse(request);
    const modelName = data.model.modelSchema.name;
    // const counter = this.meter.createCounter("completeChat.counter");
    // counter.add(1, { modelName });
    return await this.tracer.startActiveSpan("complete-chat", async (span: Span) => {
      span.setAttribute("modelName", modelName);
      return new Promise<CompleteChatHandlerResponseType>((resolve, reject) => {
        const task: QueueTask<GatewayCompleteChatRequestType, CompleteChatHandlerResponseType> = {
          id: uuidv4(),
          request: data,
          cache: this.caches.completeChat,
          resolve: (response: CompleteChatHandlerResponseType) => {
            this.analytics.record("completeChat", "success", { modelName, usage: response.response.usage || {} });
            resolve(response);
          },
          reject: (error: any) => {
            console.log("completeChat error", error);
            this.analytics.record("completeChat", "error", { modelName });
            reject(error);
          },
          execute: this.executeCompleteChat.bind(this),
          telemetryContext: context.active(),
        };
        this.queues.completeChat.enqueue(task);
        this.logger?.debug(`gateway.completeChat task enqueued, id: ${task.id}`);
      });
    });
  }

  private async executeCompleteChat(
    request: GatewayCompleteChatRequestType,
    telemetryContext: Context
  ): Promise<CompleteChatHandlerResponseType> {
    this.logger?.debug("gateway.executeCompleteChat invoked");
    const data = GatewayCompleteChatRequest.parse(request);
    return handleCompleteChat(
      {
        cache: this.caches.completeChat,
        model: data.model,
        config: data.config,
        messages: data.messages,
        tools: data.tools,
        enableCache: data.options?.enableCache ?? true,
        callbacks: this.options.completeChatCallbacks,
        metadataForCallbacks: data.options?.metadataForCallbacks,
      },
      this.httpClient,
      telemetryContext
    );
  }

  async *streamChat(request: GatewayStreamChatRequestType): AsyncGenerator<StreamChatHandlerResponseType, void, unknown> {
    this.logger?.info("gateway.streamChat invoked");
    this.logger?.debug("request: ", { request });
    const data = GatewayStreamChatRequest.parse(request);
    const modelName = data.model.modelSchema.name;

    let status = "success";
    const span = this.tracer.startSpan("stream-chat");
    const activeContext = trace.setSpan(context.active(), span);

    try {
      span.setAttribute("modelName", modelName);
      return yield* await context.with(activeContext, async () => {
        return handleStreamChat(
          {
            model: data.model,
            config: data.config,
            messages: data.messages,
            tools: data.tools,
            callbacks: this.options.streamChatCallbacks,
            metadataForCallbacks: data.options?.metadataForCallbacks,
          },
          this.httpClient,
          activeContext
        );
      });
    } catch (error) {
      status = "error";
      span.setStatus({ code: SpanStatusCode.ERROR, message: "stream failed" });
      this.logger?.error("gateway.streamChat error: ", { error });
      if (error instanceof GatewayError) throw error;
      else throw new GatewayError((error as any)?.message, 500, (error as any)?.response?.data);
    } finally {
      this.analytics.record("streamChat", status, { modelName });
      span.end();
    }
  }

  async getEmbeddings(request: GatewayGetEmbeddingsRequestType): Promise<GetEmbeddingsHandlerResponseType> {
    this.logger?.info("gateway.getEmbeddings invoked");
    this.logger?.debug("request: ", { request });
    const data = GatewayGetEmbeddingsRequest.parse(request);
    const modelName = data.model.modelSchema.name;
    return await this.tracer.startActiveSpan("get-embeddings", async (span: Span) => {
      span.setAttribute("modelName", modelName);
      return new Promise<GetEmbeddingsHandlerResponseType>((resolve, reject) => {
        const task: QueueTask<GatewayGetEmbeddingsRequestType, GetEmbeddingsHandlerResponseType> = {
          id: uuidv4(),
          request: data,
          cache: this.caches.getEmbeddings,
          resolve: (response: GetEmbeddingsHandlerResponseType) => {
            this.analytics.record("getEmbeddings", "success", { modelName, usage: response.response.usage || {} });
            resolve(response);
          },
          reject: (error: any) => {
            this.analytics.record("getEmbeddings", "error", { modelName });
            reject(error);
          },
          execute: this.executeGetEmbeddings.bind(this),
          telemetryContext: context.active(),
        };
        this.queues.getEmbeddings.enqueue(task);
        this.logger?.debug(`gateway.getEmbeddings task enqueued, id: ${task.id}`);
      });
    });
  }

  private async executeGetEmbeddings(
    request: GatewayGetEmbeddingsRequestType,
    telemetryContext: Context
  ): Promise<GetEmbeddingsHandlerResponseType> {
    this.logger?.debug("gateway.executeGetEmbeddings invoked");
    const data = GatewayGetEmbeddingsRequest.parse(request);
    return handleGetEmbeddings(
      {
        cache: this.caches.getEmbeddings,
        model: data.model,
        config: data.config,
        embeddingRequests: data.embeddingRequests,
        enableCache: data.options?.enableCache ?? true,
        callbacks: this.options.getEmbeddingsCallbacks,
        metadataForCallbacks: data.options?.metadataForCallbacks,
      },
      this.httpClient,
      telemetryContext
    );
  }

  static GatewayError = GatewayError;
}

export { Gateway, type GatewayOptionsType };

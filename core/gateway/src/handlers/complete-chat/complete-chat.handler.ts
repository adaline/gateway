import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";

import { GatewayError } from "../../errors/errors";
import { HttpClient, HttpRequestError, LoggerManager, TelemetryManager } from "../../plugins";
import { castToError, getCacheKeyHash, safelyInvokeCallbacks } from "../../utils";
import {
  CompleteChatCallbackType,
  CompleteChatHandlerRequest,
  CompleteChatHandlerRequestType,
  CompleteChatHandlerResponseType,
} from "./complete-chat.types";

async function handleCompleteChat(
  request: CompleteChatHandlerRequestType,
  client: HttpClient,
  telemetryContext?: Context
): Promise<CompleteChatHandlerResponseType> {
  const logger = LoggerManager.getLogger();
  const _handleCompleteChat = async (span?: Span) => {
    logger?.debug("handleCompleteChat invoked");
    logger?.debug("handleCompleteChat request: ", { request });
    const data = CompleteChatHandlerRequest.parse(request);
    const callbacks = request.callbacks || [];
    const handlerTelemetryContext = context.active();

    try {
      safelyInvokeCallbacks<CompleteChatCallbackType, keyof CompleteChatCallbackType>(
        callbacks,
        "onChatStart",
        request.metadataForCallbacks
      );

      const providerData = {
        config: data.config,
        messages: data.messages,
        tools: data.tools,
      };

      const providerRequest = {
        url: await data.model.getCompleteChatUrl(data.config, data.messages, data.tools),
        headers: await data.model.getCompleteChatHeaders(data.config, data.messages, data.tools),
        data: await data.model.getCompleteChatData(data.config, data.messages, data.tools),
      };

      providerRequest.headers = {
        ...providerRequest.headers,
        source: "adaline.ai",
      };

      if (data.customHeaders) {
        providerRequest.headers = {
          ...providerRequest.headers,
          ...data.customHeaders,
        };
      }
      
      logger?.debug("handleCompleteChat providerRequest: ", { providerRequest });
      const cacheKey = getCacheKeyHash(`complete-chat:${providerRequest.url}:${data.model.modelSchema.name}`, providerData);
      if (data.enableCache) {
        logger?.debug("handleCompleteChat checking cache");
        const cachedResponse = await request.cache.get(cacheKey);
        if (cachedResponse) {
          cachedResponse.cached = true;
          logger?.debug("handleCompleteChat cached hit");
          span?.setAttribute("cached", true);
          span?.setStatus({ code: SpanStatusCode.OK });
          safelyInvokeCallbacks<CompleteChatCallbackType, keyof CompleteChatCallbackType>(
            callbacks,
            "onChatCached",
            request.metadataForCallbacks,
            cachedResponse
          );
          logger?.debug("handleCompleteChat cached response: ", { cachedResponse });
          return cachedResponse;
        }
      }

      logger?.debug("handleCompleteChat cache miss");
      const now = Date.now();
      const providerResponse = await client.post(
        providerRequest.url,
        providerRequest.data,
        providerRequest.headers,
        handlerTelemetryContext
      );
      const latencyInMs = Date.now() - now;
      logger?.debug("handleCompleteChat providerResponse: ", { providerResponse });

      const response: CompleteChatHandlerResponseType = {
        request: providerData,
        response: data.model.transformCompleteChatResponse(providerResponse.data),
        cached: false,
        latencyInMs,
        metadataForCallbacks: request.metadataForCallbacks,
        provider: {
          request: providerRequest,
          response: providerResponse,
        },
      };

      logger?.debug("handleCompleteChat response: ", { response });
      if (data.enableCache) {
        await request.cache.set(cacheKey, response);
        logger?.debug("handleCompleteChat response cached");
      }

      span?.setAttribute("cached", false);
      span?.setStatus({ code: SpanStatusCode.OK });
      safelyInvokeCallbacks<CompleteChatCallbackType, keyof CompleteChatCallbackType>(
        callbacks,
        "onChatComplete",
        request.metadataForCallbacks,
        response
      );

      return response;
    } catch (error) {
      logger?.warn("handleCompleteChat error: ", { error });
      let safeError: GatewayError | HttpRequestError;

      if (HttpRequestError.isHttpRequestError(error)) {
        safeError = error;
      } else if (error instanceof GatewayError) {
        safeError = error;
      } else {
        safeError = castToError(error);
      }

      // TODO: maybe only set if it's non HTTP Error ?
      // span?.setStatus({ code: SpanStatusCode.ERROR, message: safeError.message });
      safelyInvokeCallbacks<CompleteChatCallbackType, keyof CompleteChatCallbackType>(
        callbacks,
        "onChatError",
        request.metadataForCallbacks,
        safeError
      );

      throw safeError;
    } finally {
      span?.end();
    }
  };

  if (!telemetryContext) {
    return await _handleCompleteChat();
  }

  return await context.with(telemetryContext, async () => {
    const tracer = TelemetryManager.getTracer();
    return await tracer.startActiveSpan("complete-chat.handler", async (span: Span) => {
      return await _handleCompleteChat(span);
    });
  });
}

export { handleCompleteChat };

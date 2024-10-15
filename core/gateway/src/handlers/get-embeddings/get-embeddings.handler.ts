import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";

import { GatewayError } from "../../errors/errors";
import { HttpClient, HttpRequestError, LoggerManager, TelemetryManager } from "../../plugins";
import { castToError, getCacheKeyHash, safelyInvokeCallbacks } from "../../utils";
import {
  GetEmbeddingsCallbackType,
  GetEmbeddingsHandlerRequest,
  GetEmbeddingsHandlerRequestType,
  GetEmbeddingsHandlerResponseType,
} from "./get-embeddings.types";

async function handleGetEmbeddings(
  request: GetEmbeddingsHandlerRequestType,
  client: HttpClient,
  telemetryContext?: Context
): Promise<GetEmbeddingsHandlerResponseType> {
  const logger = LoggerManager.getLogger();
  const _handleGetEmbeddings = async (span?: Span) => {
    logger?.debug("handleGetEmbeddings invoked");
    logger?.debug("handleGetEmbeddings request: ", { request });
    const data = GetEmbeddingsHandlerRequest.parse(request);
    const callbacks = request.callbacks || [];
    const handlerTelemetryContext = context.active();

    try {
      safelyInvokeCallbacks<GetEmbeddingsCallbackType, keyof GetEmbeddingsCallbackType>(
        callbacks,
        "onGetEmbeddingsStart",
        request.metadataForCallbacks
      );

      const providerData = {
        config: data.config,
        embeddingRequests: data.embeddingRequests,
      };

      const providerRequest = {
        url: await data.model.getGetEmbeddingsUrl(data.config, data.embeddingRequests),
        headers: await data.model.getGetEmbeddingsHeaders(data.config, data.embeddingRequests),
        data: await data.model.getGetEmbeddingsData(data.config, data.embeddingRequests),
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

      logger?.debug("handleGetEmbeddings providerRequest: ", { providerRequest });
      const cacheKey = getCacheKeyHash(`get-embeddings:${providerRequest.url}:${data.model.modelSchema.name}`, providerData);
      if (data.enableCache) {
        logger?.debug("handleGetEmbeddings checking cache");
        const cachedResponse = await request.cache.get(cacheKey);
        if (cachedResponse) {
          cachedResponse.cached = true;
          logger?.debug("handleGetEmbeddings cached hit");
          span?.setAttribute("cached", true);
          span?.setStatus({ code: SpanStatusCode.OK });
          safelyInvokeCallbacks<GetEmbeddingsCallbackType, keyof GetEmbeddingsCallbackType>(
            callbacks,
            "onGetEmbeddingsCached",
            request.metadataForCallbacks,
            cachedResponse
          );
          logger?.debug("handleGetEmbeddings cached response: ", { cachedResponse });
          return cachedResponse;
        }
      }

      logger?.debug("handleGetEmbeddings cache miss");
      const now = Date.now();
      const providerResponse = await client.post(
        providerRequest.url,
        providerRequest.data,
        providerRequest.headers,
        handlerTelemetryContext
      );
      const latencyInMs = Date.now() - now;
      logger?.debug("handleGetEmbeddings providerResponse: ", { providerResponse });

      const response: GetEmbeddingsHandlerResponseType = {
        request: providerData,
        response: data.model.transformGetEmbeddingsResponse(providerResponse.data),
        cached: false,
        latencyInMs,
        metadataForCallbacks: request.metadataForCallbacks,
        provider: {
          request: providerRequest,
          response: providerResponse,
        },
      };

      logger?.debug("handleGetEmbeddings response: ", { response });
      if (data.enableCache) {
        await request.cache.set(cacheKey, response);
        logger?.debug("handleGetEmbeddings response cached");
      }

      span?.setAttribute("cached", false);
      span?.setStatus({ code: SpanStatusCode.OK });
      safelyInvokeCallbacks<GetEmbeddingsCallbackType, keyof GetEmbeddingsCallbackType>(
        callbacks,
        "onGetEmbeddingsComplete",
        request.metadataForCallbacks,
        response
      );

      return response;
    } catch (error) {
      logger?.warn("handleGetEmbeddings error: ", { error });
      let safeError: GatewayError | HttpRequestError;

      if (HttpRequestError.isHttpRequestError(error)) {
        safeError = error;
      } else if (error instanceof GatewayError) {
        safeError = error;
      } else {
        safeError = castToError(error);
      }

      // span?.setStatus({ code: SpanStatusCode.ERROR, message: safeError.message });
      safelyInvokeCallbacks<GetEmbeddingsCallbackType, keyof GetEmbeddingsCallbackType>(
        callbacks,
        "onGetEmbeddingsError",
        request.metadataForCallbacks,
        safeError
      );

      throw safeError;
    } finally {
      span?.end();
    }
  };

  if (!telemetryContext) {
    return await _handleGetEmbeddings();
  }

  return await context.with(telemetryContext, async () => {
    const tracer = TelemetryManager.getTracer();
    return await tracer.startActiveSpan("get-embeddings.handler", async (span: Span) => {
      return await _handleGetEmbeddings(span);
    });
  });
}

export { handleGetEmbeddings };

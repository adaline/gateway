import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";

import { GatewayError } from "../../errors/errors";
import { HttpClient, HttpRequestError, LoggerManager, TelemetryManager } from "../../plugins";
import { castToError } from "../../utils";
import type { ProxyGetEmbeddingsHandlerRequestType, ProxyGetEmbeddingsHandlerResponseType } from "./proxy-get-embeddings.types";
import { ProxyGetEmbeddingsHandlerRequest } from "./proxy-get-embeddings.types";

async function handleProxyGetEmbeddings(
  request: ProxyGetEmbeddingsHandlerRequestType,
  client: HttpClient,
  telemetryContext?: Context
): Promise<ProxyGetEmbeddingsHandlerResponseType> {
  const logger = LoggerManager.getLogger();
  const _handleProxyGetEmbeddings = async (span?: Span) => {
    logger?.debug("handleProxyGetEmbeddings invoked");
    logger?.debug("handleProxyGetEmbeddings request: ", { request });
    const data = ProxyGetEmbeddingsHandlerRequest.parse(request);
    const handlerTelemetryContext = context.active();

    try {
      const providerRequest = {
        url: await data.model.getGetEmbeddingsUrl(),
        headers: data.headers,
        data: data.data,
      };

      providerRequest.headers = {
        ...providerRequest.headers,
        source: "adaline.ai",
      };

      const sanitizedProviderRequest = { ...providerRequest };
      delete sanitizedProviderRequest.headers.host;
      delete sanitizedProviderRequest.headers["content-length"];

      logger?.debug("handleProxyGetEmbeddings providerRequest: ", { providerRequest });

      const providerResponse = await client.post(
        sanitizedProviderRequest.url,
        sanitizedProviderRequest.data,
        sanitizedProviderRequest.headers,
        handlerTelemetryContext
      );
      logger?.debug("handleProxyGetEmbeddings providerResponse: ", { providerResponse });

      const response: ProxyGetEmbeddingsHandlerResponseType = {
        request: providerRequest,
        providerRequest: sanitizedProviderRequest,
        providerResponse: providerResponse,
        transformedResponse: data.model.transformGetEmbeddingsResponse(providerResponse.data),
      };

      logger?.debug("handleProxyGetEmbeddings response: ", { response });

      span?.setStatus({ code: SpanStatusCode.OK });

      return response;
    } catch (error) {
      logger?.warn("handleProxyGetEmbeddings error: ", { error });
      let safeError: GatewayError | HttpRequestError;

      if (HttpRequestError.isHttpRequestError(error)) {
        safeError = error;
      } else if (error instanceof GatewayError) {
        safeError = error;
      } else {
        safeError = castToError(error);
      }

      throw safeError;
    } finally {
      span?.end();
    }
  };

  if (!telemetryContext) {
    return await _handleProxyGetEmbeddings();
  }

  return await context.with(telemetryContext, async () => {
    const tracer = TelemetryManager.getTracer();
    return await tracer.startActiveSpan("proxy-get-embeddings.handler", async (span: Span) => {
      return await _handleProxyGetEmbeddings(span);
    });
  });
}

export { handleProxyGetEmbeddings };

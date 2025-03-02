import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";

import { GatewayError } from "../../errors/errors";
import { HttpClient, HttpRequestError, LoggerManager, TelemetryManager } from "../../plugins";
import { castToError } from "../../utils";
import type { ProxyCompleteChatHandlerRequestType, ProxyCompleteChatHandlerResponseType } from "./proxy-complete-chat.types";
import { ProxyCompleteChatHandlerRequest } from "./proxy-complete-chat.types";

async function handleProxyCompleteChat(
  request: ProxyCompleteChatHandlerRequestType,
  client: HttpClient,
  telemetryContext?: Context
): Promise<ProxyCompleteChatHandlerResponseType> {
  const logger = LoggerManager.getLogger();
  const _handleProxyCompleteChat = async (span?: Span) => {
    logger?.debug("handleProxyCompleteChat invoked");
    logger?.debug("handleProxyCompleteChat request: ", { request });
    const data = ProxyCompleteChatHandlerRequest.parse(request);
    const handlerTelemetryContext = context.active();

    try {
      data.headers = { ...data.headers, source: "adaline.ai" };

      const providerRequest = {
        url: await data.model.getCompleteChatUrl(),
        headers: await data.model.getProxyCompleteChatHeaders(data.data, data.headers, data.query),
        data: data.data,
      };
      logger?.debug("handleProxyCompleteChat providerRequest: ", { providerRequest });

      const providerResponse = await client.post(
        providerRequest.url,
        providerRequest.data,
        providerRequest.headers,
        handlerTelemetryContext
      );
      logger?.debug("handleProxyCompleteChat providerResponse: ", { providerResponse });

      const response: ProxyCompleteChatHandlerResponseType = {
        request: { header: data.headers, data: data.data, query: data.query },
        providerRequest: providerRequest,
        providerResponse: providerResponse,
        transformedResponse: data.model.transformCompleteChatResponse(providerResponse.data),
      };

      logger?.debug("handleProxyCompleteChat response: ", { response });

      span?.setStatus({ code: SpanStatusCode.OK });

      return response;
    } catch (error) {
      logger?.warn("handleProxyCompleteChat error: ", { error });
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
    return await _handleProxyCompleteChat();
  }

  return await context.with(telemetryContext, async () => {
    const tracer = TelemetryManager.getTracer();
    return await tracer.startActiveSpan("proxy-complete-chat.handler", async (span: Span) => {
      return await _handleProxyCompleteChat(span);
    });
  });
}

export { handleProxyCompleteChat };

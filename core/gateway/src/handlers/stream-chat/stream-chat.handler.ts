import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";

import { GatewayError } from "../../errors/errors";
import { HttpClient, HttpRequestError, LoggerManager, TelemetryManager } from "../../plugins";
import { castToError, safelyInvokeCallbacks } from "../../utils";
import {
  StreamChatCallbackType,
  StreamChatHandlerRequest,
  StreamChatHandlerRequestType,
  StreamChatHandlerResponseType,
} from "./stream-chat.types";

async function* handleStreamChat<M>(
  request: StreamChatHandlerRequestType,
  client: HttpClient,
  telemetryContext?: Context
): AsyncGenerator<StreamChatHandlerResponseType, void, unknown> {
  const logger = LoggerManager.getLogger();
  const _handleStreamChat = async function* (span?: Span): AsyncGenerator<StreamChatHandlerResponseType, void, unknown> {
    logger?.debug("handleStreamChat invoked");
    logger?.debug("handleStreamChat request: ", { request });
    const data = StreamChatHandlerRequest.parse(request);
    const callbacks = request.callbacks || [];

    const stable = {
      config: data.config,
      messages: data.messages,
      tools: data.tools,
    };

    try {
      safelyInvokeCallbacks<StreamChatCallbackType, keyof StreamChatCallbackType>(callbacks, "onStreamStart", request.metadataForCallbacks);

      const providerRequest = {
        url: await data.model.getStreamChatUrl(data.config, data.messages, data.tools),
        headers: await data.model.getStreamChatHeaders(data.config, data.messages, data.tools),
        data: await data.model.getStreamChatData(data.config, data.messages, data.tools),
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
      logger?.debug("handleStreamChat providerRequest: ", { providerRequest });

      let buffer = "";
      let isFirstResponse = true;
      for await (const chunk of client.stream(providerRequest.url, "post", providerRequest.data, providerRequest.headers)) {
        for await (const transformed of data.model.transformStreamChatResponseChunk(chunk as string, buffer)) {
          if (transformed.partialResponse.partialMessages.length > 0) {
            const streamResponse = {
              request: stable,
              response: transformed.partialResponse,
              metadataForCallbacks: request.metadataForCallbacks,
              provider: {
                request: providerRequest,
                response: chunk,
              },
            };

            safelyInvokeCallbacks<StreamChatCallbackType<M>, keyof StreamChatCallbackType<M>>(
              callbacks,
              isFirstResponse ? "onStreamFirstResponse" : "onStreamNewResponse",
              request.metadataForCallbacks,
              streamResponse
            );

            if (isFirstResponse) {
              isFirstResponse = false;
            }

            logger?.debug("handleStreamChat streamResponse: ", { streamResponse });
            yield streamResponse;
          } else {
            buffer = transformed.buffer;
          }
        }
      }

      span?.setStatus({ code: SpanStatusCode.OK });
      safelyInvokeCallbacks<StreamChatCallbackType<M>, keyof StreamChatCallbackType<M>>(
        callbacks,
        "onStreamEnd",
        request.metadataForCallbacks
      );
    } catch (error) {
      logger?.warn("handleStreamChat error: ", { error });
      let safeError: GatewayError | HttpRequestError;

      if (HttpRequestError.isHttpRequestError(error)) {
        safeError = error;
      } else if (error instanceof GatewayError) {
        safeError = error;
      } else {
        safeError = castToError(error);
      }

      // span?.setStatus({ code: SpanStatusCode.ERROR, message: safeError.message });
      safelyInvokeCallbacks<StreamChatCallbackType<M>, keyof StreamChatCallbackType<M>>(
        callbacks,
        "onStreamError",
        request.metadataForCallbacks,
        safeError
      );

      throw safeError;
    } finally {
      span?.end();
    }
  };

  if (!telemetryContext) {
    return yield* _handleStreamChat();
  }

  return yield* await context.with(telemetryContext, async () => {
    const tracer = TelemetryManager.getTracer();
    return await tracer.startActiveSpan("stream-chat.handler", async (span: Span) => {
      return await _handleStreamChat(span);
    });
  });
}

export { handleStreamChat };

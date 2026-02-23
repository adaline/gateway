import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";

import { GatewayError } from "../../errors/errors";
import { HttpClient, HttpRequestError, LoggerManager, TelemetryManager } from "../../plugins";
import { castToError, isRunningInBrowser, normalizeProviderResponseSchemaByUrl, safelyInvokeCallbacks } from "../../utils";
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
    const handlerTelemetryContext = context.active();

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
      providerRequest.data = normalizeProviderResponseSchemaByUrl(providerRequest.data, providerRequest.url);

      if (!isRunningInBrowser()) {
        providerRequest.headers = {
          ...providerRequest.headers,
          source: "adaline.ai",
        };
      }

      if (data.customHeaders) {
        providerRequest.headers = {
          ...providerRequest.headers,
          ...data.customHeaders,
        };
      }
      logger?.debug("handleStreamChat providerRequest: ", { providerRequest });

      let buffer = "";
      let isFirstResponse = true;
      for await (const chunk of client.stream(
        providerRequest.url,
        "post",
        providerRequest.data,
        providerRequest.headers,
        {
          abortSignal: request.abortSignal,
        },
        handlerTelemetryContext
      )) {
        for await (const transformed of data.model.transformStreamChatResponseChunk(chunk as string, buffer)) {
          // Update the buffer with the remainder returned by the transformer
          buffer = transformed.buffer;

          // Check if the partial response contains messages or usage information
          const hasMessages = transformed.partialResponse?.partialMessages?.length > 0;
          // Assuming usage information might be present in the partialResponse object, e.g., transformed.partialResponse.usage
          const hasUsage = transformed.partialResponse?.usage != null; // Adjust this check based on the actual structure of usage data

          // Yield the response if it contains messages or usage data
          if (hasMessages || hasUsage) {
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
          }
          // If the transformed part contains neither messages nor usage,
          // we simply continue with the updated buffer to process the next part or chunk.
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

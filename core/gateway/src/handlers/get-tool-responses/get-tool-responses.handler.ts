import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";

import { ToolCallContentType, ToolResponseContentType } from "@adaline/types";

import { GatewayError } from "../../errors/errors";
import { HttpClient, HttpRequestError, LoggerManager, TelemetryManager } from "../../plugins";
import { castToError, safelyInvokeCallbacks } from "../../utils";
import {
  GetToolResponsesHandlerRequest,
  GetToolResponsesHandlerRequestType,
  GetToolResponsesHandlerResponseType,
} from "./get-tool-responses.types";

async function handleGetToolResponses(
  request: GetToolResponsesHandlerRequestType,
  client: HttpClient,
  telemetryContext?: Context
): Promise<GetToolResponsesHandlerResponseType> {
  const logger = LoggerManager.getLogger();
  const _handleGetToolResponses = async (span?: Span) => {
    logger?.debug("handleGetToolResponses invoked");
    logger?.debug("handleGetToolResponses request: ", { request });
    const data = GetToolResponsesHandlerRequest.parse(request);
    const tools = data.tools;
    const messages = data.messages;

    const toolCalls = messages.reduce((acc, message) => {
      const contentToolCalls = message.content.reduce((acc_, content) => {
        if (content.modality === "tool-call") {
          acc_.push(content);
        }
        return acc_;
      }, [] as ToolCallContentType[]);
      return [...acc, ...contentToolCalls];
    }, [] as ToolCallContentType[]);

    const callbacks = request.callbacks || [];
    const handlerTelemetryContext = context.active();

    try {
      const now = Date.now();

      const toolCallPromises = toolCalls.map(async (toolCall) => {
        const tool = tools.find((t) => t.definition.schema.name === toolCall.name);
        if (!tool?.request || tool.request.type !== "http") {
          return null;
        }

        const requestSettings = tool.request;
        const requestMethod = requestSettings.method.toLowerCase();
        const retrySettings = requestSettings.retry || {
          maxAttempts: 3,
          initialDelay: 1000,
          exponentialFactor: 2,
        };

        return await context.with(handlerTelemetryContext, async () => {
          const tracer = TelemetryManager.getTracer();
          return await tracer.startActiveSpan(`tool-call.${toolCall.name}`, async (span: Span) => {
            try {
              span.setAttribute("tool.name", toolCall.name);
              span.setAttribute("tool.id", toolCall.id);

              if (callbacks) {
                await safelyInvokeCallbacks(callbacks, "onGetToolResponseStart", toolCall, request.metadataForCallbacks);
              }

              let queryParams: Record<string, string> | undefined;
              let body: Record<string, unknown> | undefined;
              try {
                const bodyOrQuery = JSON.parse(toolCall.arguments);
                if (requestMethod === "get") {
                  queryParams = bodyOrQuery as Record<string, string>;
                } else {
                  body = bodyOrQuery as Record<string, unknown>;
                }
              } catch (error) {
                const warningMessage =
                  `executeToolCalls: Error parsing arguments for tool call: ${toolCall.name},` +
                  ` arguments: ${toolCall.arguments}, error: ${error instanceof Error ? error.message : String(error)}`;
                logger?.warn(warningMessage);
              }

              let response;
              const url = requestSettings.url;
              const headers = {
                ...requestSettings.headers,
                "Content-Type": "application/json",
              }

              if (requestSettings.proxyUrl) {
                // encapsulate the original request for the proxy request
                response = await client.post(
                  requestSettings.proxyUrl,
                  {
                    method: requestMethod,
                    url,
                    headers,
                    ...(requestMethod === "get" ? { query: queryParams } : {}),
                    ...(requestMethod === "post" ? { body } : {}),
                  },
                  requestSettings.proxyHeaders,
                  { retry: retrySettings },
                  handlerTelemetryContext
                );
              } else {
                if (requestMethod === "get") {
                  response = await client.get(
                    url,
                    queryParams,
                    headers,
                    { retry: retrySettings },
                    handlerTelemetryContext
                  );
                } else if (requestMethod === "post") {
                  response = await client.post(
                    url,
                    body,
                    headers,
                    { retry: retrySettings },
                    handlerTelemetryContext
                  );
                } else {
                  throw new GatewayError(`Unsupported HTTP method: ${requestSettings.method}`, 400);
                }
              }
              span.setStatus({ code: SpanStatusCode.OK });

              const toolResponse = {
                modality: "tool-response" as const,
                index: toolCall.index,
                id: toolCall.id,
                name: toolCall.name,
                data: JSON.stringify(response.data),
                apiResponse: {
                  statusCode: response.status.code,
                },
              } as ToolResponseContentType;

              if (callbacks) {
                await safelyInvokeCallbacks(
                  callbacks, 
                  "onGetToolResponseComplete", 
                  toolCall, 
                  toolResponse, 
                  request.metadataForCallbacks
                );
              }

              return toolResponse;
            } catch (error) {
              const safeError = castToError(error);
              if (callbacks) {
                await safelyInvokeCallbacks(callbacks, "onGetToolResponseError", toolCall, request.metadataForCallbacks, safeError);
              }

              span.setStatus({ code: SpanStatusCode.ERROR, message: safeError.message });
              logger?.warn(`Tool call ${toolCall.name} failed:`, error);

              const toolResponse = {
                modality: "tool-response" as const,
                index: toolCall.index,
                id: toolCall.id,
                name: toolCall.name,
                data: safeError.message,
                apiResponse: {
                  statusCode: safeError.status,
                },
              };

              if (callbacks) {
                await safelyInvokeCallbacks(
                  callbacks,
                  "onGetToolResponseError",
                  toolCall,
                  toolResponse,
                  request.metadataForCallbacks,
                  safeError
                );
              }

              return toolResponse;
            } finally {
              span.end();
            }
          });
        });
      });

      const allToolResponses = await Promise.all(toolCallPromises);
      const toolResponses = allToolResponses
        .filter((result) => result !== null)
        .reduce(
          (acc, result) => {
            acc[result.id] = result;
            return acc;
          },
          {} as Record<string, ToolResponseContentType>
        );

      const latencyInMs = Date.now() - now;
      logger?.debug("handleGetToolResponses toolResponses: ", { toolResponses });

      const response: GetToolResponsesHandlerResponseType = {
        toolResponses,
        cached: false,
        latencyInMs,
        metadataForCallbacks: request.metadataForCallbacks,
      };

      logger?.debug("handleGetToolResponses response: ", { response });
      span?.setStatus({ code: SpanStatusCode.OK });

      return response;
    } catch (error) {
      logger?.warn("handleGetToolResponses error: ", { error });
      let safeError: GatewayError | HttpRequestError;

      if (HttpRequestError.isHttpRequestError(error)) {
        safeError = error;
      } else if (error instanceof GatewayError) {
        safeError = error;
      } else {
        safeError = castToError(error);
      }

      span?.setStatus({ code: SpanStatusCode.ERROR, message: safeError.message });
      throw safeError;
    } finally {
      span?.end();
    }
  };

  if (!telemetryContext) {
    return await _handleGetToolResponses();
  }

  return await context.with(telemetryContext, async () => {
    const tracer = TelemetryManager.getTracer();
    return await tracer.startActiveSpan("get-tool-responses.handler", async (span: Span) => {
      return await _handleGetToolResponses(span);
    });
  });
}

export { handleGetToolResponses };

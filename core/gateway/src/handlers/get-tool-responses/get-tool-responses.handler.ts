import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";

import { ToolCallContentType, ToolResponseContentType, ToolType } from "@adaline/types";

import { GatewayError } from "../../errors/errors";
import { HttpClient, HttpRequestError, LoggerManager, TelemetryManager } from "../../plugins";
import { castToError, getCacheKeyHash, safelyInvokeCallbacks } from "../../utils";
import {
  GetToolResponsesCallbackType,
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
    const callbacks = request.callbacks || [];
    const handlerTelemetryContext = context.active();

    try {
      safelyInvokeCallbacks<GetToolResponsesCallbackType, keyof GetToolResponsesCallbackType>(
        callbacks,
        "onGetToolResponsesStart",
        request.metadataForCallbacks
      );

      const providerData = {
        tools: data.tools,
        toolCalls: data.toolCalls,
      };

      const cacheKey = getCacheKeyHash(`get-tool-responses`, providerData);
      if (data.enableCache) {
        logger?.debug("handleGetToolResponses checking cache");
        const cachedResponse = await request.cache.get(cacheKey);
        if (cachedResponse) {
          cachedResponse.cached = true;
          logger?.debug("handleGetToolResponses cached hit");
          span?.setAttribute("cached", true);
          span?.setStatus({ code: SpanStatusCode.OK });
          safelyInvokeCallbacks<GetToolResponsesCallbackType, keyof GetToolResponsesCallbackType>(
            callbacks,
            "onGetToolResponsesCached",
            request.metadataForCallbacks,
            cachedResponse
          );
          logger?.debug("handleGetToolResponses cached response: ", { cachedResponse });
          return cachedResponse;
        }
      }

      logger?.debug("handleGetToolResponses cache miss");
      const now = Date.now();

      const toolResponses = await executeToolCalls(
        data.toolCalls,
        data.tools,
        client,
        callbacks,
        request.metadataForCallbacks,
        handlerTelemetryContext,
      );

      const latencyInMs = Date.now() - now;
      logger?.debug("handleGetToolResponses toolResponses: ", { toolResponses });

      const response: GetToolResponsesHandlerResponseType = {
        request: providerData,
        response: toolResponses,
        cached: false,
        latencyInMs,
        metadataForCallbacks: request.metadataForCallbacks,
      };

      logger?.debug("handleGetToolResponses response: ", { response });
      if (data.enableCache) {
        await request.cache.set(cacheKey, response);
        logger?.debug("handleGetToolResponses response cached");
      }

      span?.setAttribute("cached", false);
      span?.setStatus({ code: SpanStatusCode.OK });
      safelyInvokeCallbacks<GetToolResponsesCallbackType, keyof GetToolResponsesCallbackType>(
        callbacks,
        "onGetToolResponsesComplete",
        request.metadataForCallbacks,
        response
      );

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
      safelyInvokeCallbacks<GetToolResponsesCallbackType, keyof GetToolResponsesCallbackType>(
        callbacks,
        "onGetToolResponsesError",
        request.metadataForCallbacks,
        safeError
      );

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

async function executeToolCalls(
  toolCalls: ToolCallContentType[],
  tools: ToolType[],
  client: HttpClient,
  callbacks?: any[],
  metadataForCallbacks?: any,
  telemetryContext?: Context
): Promise<ToolResponseContentType[]> {
  const logger = LoggerManager.getLogger();

  const toolCallPromises = toolCalls.map(async (toolCall) => {
    const tool = tools.find(t => t.definition.schema.name === toolCall.name);
    if (!tool?.requestSettings || tool.requestSettings.type !== "http") {
      return null;
    }

    const settings = tool.requestSettings;
    
    return await context.with(telemetryContext || context.active(), async () => {
      const tracer = TelemetryManager.getTracer();
      return await tracer.startActiveSpan(`tool-call.${toolCall.name}`, async (span: Span) => {
        try {
          span.setAttribute("tool.name", toolCall.name);
          span.setAttribute("tool.id", toolCall.id);
          
          if (callbacks) {
            await safelyInvokeCallbacks(callbacks, "onGetToolResponsesStart", metadataForCallbacks, toolCall);
          }
          
          let response;
          if (settings.method === "get") {
            const params = settings.query || {};
            response = await client.get(settings.url, params, settings.headers, context.active());
          } else {
            const body = settings.body || JSON.parse(toolCall.arguments || "{}");
            response = await client.post(settings.url, body, settings.headers, context.active());
          }

          span.setStatus({ code: SpanStatusCode.OK });
          
          const toolResponse = {
            modality: "tool-response" as const,
            index: toolCall.index,
            id: toolCall.id,
            name: toolCall.name,
            data: JSON.stringify(response.data),
          } as ToolResponseContentType;
          
          if (callbacks) {
            await safelyInvokeCallbacks(callbacks, "onGetToolResponsesComplete", metadataForCallbacks, toolCall, toolResponse);
          }
          
          return toolResponse;
        } catch (error) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
          logger?.warn(`Tool call ${toolCall.name} failed:`, error);
          
          const toolResponse = {
            modality: "tool-response" as const,
            index: toolCall.index,
            id: toolCall.id,
            name: toolCall.name,
            data: "",
            error: (error as Error).message,
          } as ToolResponseContentType;
          
          if (callbacks) {
            await safelyInvokeCallbacks(callbacks, "onGetToolResponsesError", metadataForCallbacks, toolCall, error);
          }
          
          return toolResponse;
        } finally {
          span.end();
        }
      });
    });
  });

  const results = await Promise.all(toolCallPromises);
  return results.filter(result => result !== null) as ToolResponseContentType[];
}

export { handleGetToolResponses };

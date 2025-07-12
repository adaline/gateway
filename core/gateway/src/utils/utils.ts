// import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";
import sha256 from "crypto-js/sha256.js";

// import { ToolCallContentType, ToolResponseContentType, ToolType } from "@adaline/types";

import { GatewayError } from "../errors/errors";
// import { CompleteChatCallbackType } from "../handlers/complete-chat/complete-chat.types";
// import { StreamChatCallbackType } from "../handlers/stream-chat/stream-chat.types";
// import { HttpClient, LoggerManager, TelemetryManager } from "../plugins";
import { HttpClientError } from "../plugins/http-client/http-client.error";

const getCacheKeyHash = (prefix: string, object: object): string => {
  return sha256(prefix + JSON.stringify(object)).toString();
};

const castToError = (err: any): GatewayError => {
  if (err instanceof GatewayError) return err;
  if (HttpClientError.isHttpClientError(err)) return new GatewayError(err.message as string);
  if (err instanceof Error) return new GatewayError(err.message as string);
  return new GatewayError(err);
};

const isRunningInBrowser = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return typeof window !== "undefined" && typeof window.document !== "undefined" && typeof navigator !== "undefined";
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
};

const logColors = {
  error: "color: red",
  warn: "color: yellow",
  info: "color: green",
};

const verbose = (level: keyof typeof logLevels, action: string, ...args: any[]) => {
  if (!isRunningInBrowser()) {
    // Node.js environment
    switch (level) {
      case "error":
        console.error(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      default:
        console.log(...args);
    }
  } else if (isRunningInBrowser()) {
    // Browser environment
    console.log(`%c[${level.toUpperCase()}] [${action}]`, logColors[level], ...args);
  }
};

const debug = (level: keyof typeof logLevels, action: string, ...args: any[]) => {
  if (isRunningInBrowser()) return;
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process?.env?.DEBUG !== "true") return;
  verbose(level, action, ...args);
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & unknown;

interface BaseCallback {
  [key: string]: (...args: any[]) => void | Promise<void>;
}

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;

const safelyInvokeCallbacks = async <T extends BaseCallback, K extends keyof T>(
  callbacks: T[],
  name: keyof T,
  ...args: ArgumentsType<T[K]>
): Promise<void> => {
  const promises: Promise<void>[] = [];

  callbacks.forEach((callback) => {
    const func = callback[name];
    if (typeof func === "function") {
      try {
        const result = func(...args);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        debug("error", `SAFELY_INVOKE_CALLBACKS:${String(name)}:`, error);
      }
    }
  });

  await Promise.allSettled(promises);
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const calcRateLimitRetryTimeout = (
  maxRetries: number,
  backOffInitialDelay: number,
  backOffMultiplier: number,
  executionTimePerAttempt: number
): number => {
  let totalDelayTime = 0;
  const totalExecutionTime = maxRetries * executionTimePerAttempt;

  for (let i = 0; i < maxRetries; i++) {
    totalDelayTime += backOffInitialDelay * Math.pow(backOffMultiplier, i);
  }

  return totalDelayTime + totalExecutionTime;
};

const defaultShouldRetry = (status: number) => {
  // Rate limit errors are handled separately.

  // Retry on request timeouts.
  if (status === 408) return true;
  // Retry on lock timeouts.
  if (status === 409) return true;
  // Retry internal errors.
  if (status >= 500) return true;

  return false;
};

// const executeToolCalls = async (
//   toolCalls: ToolCallContentType[],
//   tools: ToolType[],
//   client: HttpClient,
//   callbacks?: CompleteChatCallbackType[] | StreamChatCallbackType[],
//   metadataForCallbacks?: any,
//   telemetryContext?: Context
// ): Promise<ToolResponseContentType[]> => {
//   const logger = LoggerManager.getLogger();

//   const toolCallPromises = toolCalls.map(async (toolCall) => {
//     const tool = tools.find((t) => t.definition.schema.name === toolCall.name);
//     if (!tool?.requestSettings || tool.requestSettings.type !== "http") {
//       return null;
//     }

//     const settings = tool.requestSettings;
//     const handlerTelemetryContext = telemetryContext || context.active();
//     return await context.with(handlerTelemetryContext, async () => {
//       const tracer = TelemetryManager.getTracer();
//       return await tracer.startActiveSpan(`tool-call.${toolCall.name}`, async (span: Span) => {
//         try {
//           span.setAttribute("tool.name", toolCall.name);
//           span.setAttribute("tool.id", toolCall.id);

//           if (callbacks) {
//             await safelyInvokeCallbacks(callbacks, "onToolCallStart", metadataForCallbacks, toolCall);
//           }

//           let dataOrParams: Record<string, unknown> | undefined;
//           try {
//             dataOrParams = JSON.parse(toolCall.arguments);
//           } catch (error) {
//             const warningMessage =
//               `executeToolCalls: Error parsing arguments for tool call: ${toolCall.name},` +
//               ` arguments: ${toolCall.arguments}, error: ${error instanceof Error ? error.message : String(error)}`;
//             logger?.warn(warningMessage);
//           }

//           let response;
//           if (settings.method === "get") {
//             response = await client.get(settings.url, dataOrParams, settings.headers, handlerTelemetryContext);
//           } else {
//             response = await client.post(settings.url, dataOrParams, settings.headers, handlerTelemetryContext);
//           }

//           span.setStatus({ code: SpanStatusCode.OK });

//           const toolResponse = {
//             modality: "tool-response" as const,
//             index: toolCall.index,
//             id: toolCall.id,
//             name: toolCall.name,
//             data: JSON.stringify(response.data),
//           } as ToolResponseContentType;

//           if (callbacks) {
//             await safelyInvokeCallbacks(callbacks, "onToolCallComplete", metadataForCallbacks, toolCall, toolResponse);
//           }

//           return toolResponse;
//         } catch (error) {
//           span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
//           logger?.warn(`executeToolCalls: Tool call ${toolCall.name} failed:`, error);

//           const toolResponse = {
//             modality: "tool-response" as const,
//             index: toolCall.index,
//             id: toolCall.id,
//             name: toolCall.name,
//             data: "{}",
//             error: error instanceof Error ? error.message : String(error),
//           } as ToolResponseContentType;

//           if (callbacks) {
//             await safelyInvokeCallbacks(callbacks, "onToolCallError", metadataForCallbacks, toolCall, toolResponse);
//           }

//           return toolResponse;
//         } finally {
//           span.end();
//         }
//       });
//     });
//   });

//   const results = await Promise.all(toolCallPromises);
//   return results.filter((result) => result !== null);
// };

export {
  calcRateLimitRetryTimeout,
  castToError,
  debug,
  defaultShouldRetry,
  delay,
  getCacheKeyHash,
  isRunningInBrowser,
  safelyInvokeCallbacks,
  type Prettify,
};

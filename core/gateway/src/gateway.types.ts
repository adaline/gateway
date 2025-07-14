import { Meter, Tracer } from "@opentelemetry/api";
import { z } from "zod";

import { ChatModelV1, EmbeddingModelV1 } from "@adaline/provider";
import { ChatModelPriceType, ChatUsageType, Config, EmbeddingRequests, Message, Tool } from "@adaline/types";

import {
  CompleteChatCallbackType,
  CompleteChatHandlerResponseType,
  GetEmbeddingsCallbackType,
  GetEmbeddingsHandlerResponseType,
  GetToolResponsesCallbackType,
  GetToolResponsesHandlerResponseType,
  StreamChatCallbackType,
} from "./handlers";
import { Cache, HttpClient, Logger, QueueOptions } from "./plugins";

const GatewayOptions = z.object({
  queueOptions: z.lazy(() => QueueOptions.partial()).optional(),
  dangerouslyAllowBrowser: z.boolean().optional(),
  httpClient: z.custom<HttpClient>().optional(),
  completeChatCache: z.custom<Cache<CompleteChatHandlerResponseType>>().optional(),
  completeChatCallbacks: z.array(z.custom<CompleteChatCallbackType>()).nonempty().optional(),
  getEmbeddingsCache: z.custom<Cache<GetEmbeddingsHandlerResponseType>>().optional(),
  getEmbeddingsCallbacks: z.array(z.custom<GetEmbeddingsCallbackType>()).nonempty().optional(),
  getToolResponsesCache: z.custom<Cache<GetToolResponsesHandlerResponseType>>().optional(),
  getToolResponsesCallbacks: z.array(z.custom<GetToolResponsesCallbackType>()).nonempty().optional(),
  streamChatCallbacks: z.array(z.custom<StreamChatCallbackType>()).nonempty().optional(),
  logger: z.custom<Logger>().optional(),
  telemetry: z
    .object({
      tracer: z.custom<Tracer>().optional(),
      meter: z.custom<Meter>().optional(),
    })
    .optional(),
  enableAnalytics: z.boolean().optional(),
  enableProxyAgent: z.boolean().optional(),
});
type GatewayOptionsType = z.infer<typeof GatewayOptions>;

const GatewayCompleteChatRequestOptions = z.object({
  enableCache: z.boolean().optional().default(true),
  customHeaders: z.record(z.string()).optional(),
  metadataForCallbacks: z.any().optional(),
});
type GatewayCompleteChatRequestOptionsType = z.infer<typeof GatewayCompleteChatRequestOptions>;

const GatewayCompleteChatRequest = z.object({
  model: z.custom<ChatModelV1>(),
  config: Config(),
  messages: z.array(Message()),
  tools: z.array(Tool()).optional(),
  options: GatewayCompleteChatRequestOptions.optional(),
});
type GatewayCompleteChatRequestType = z.infer<typeof GatewayCompleteChatRequest>;

const GatewayStreamChatRequestOptions = z.object({
  customHeaders: z.record(z.string()).optional(),
  metadataForCallbacks: z.any().optional(),
});
type GatewayStreamChatRequestOptionsType = z.infer<typeof GatewayStreamChatRequestOptions>;

const GatewayStreamChatRequest = z.object({
  model: z.custom<ChatModelV1>(),
  config: Config(),
  messages: z.array(Message()),
  tools: z.array(Tool()).optional(),
  options: GatewayStreamChatRequestOptions.optional(),
  abortSignal: z.instanceof(AbortSignal).optional(),
});

type GatewayStreamChatRequestType = z.infer<typeof GatewayStreamChatRequest>;

const GatewayGetEmbeddingsRequestOptions = z.object({
  enableCache: z.boolean().optional().default(true),
  customHeaders: z.record(z.string()).optional(),
  metadataForCallbacks: z.any().optional(),
});
type GatewayGetEmbeddingsRequestOptionsType = z.infer<typeof GatewayGetEmbeddingsRequestOptions>;

const GatewayGetEmbeddingsRequest = z.object({
  model: z.custom<EmbeddingModelV1>(),
  config: Config(),
  embeddingRequests: EmbeddingRequests(),
  options: GatewayGetEmbeddingsRequestOptions.optional(),
});
type GatewayGetEmbeddingsRequestType = z.infer<typeof GatewayGetEmbeddingsRequest>;

const GatewayProxyCompleteChatRequest = z.object({
  model: z.custom<ChatModelV1>(),
  data: z.any(),
  headers: z.record(z.string()),
  query: z.record(z.string()).optional(),
});
type GatewayProxyCompleteChatRequestType = z.infer<typeof GatewayProxyCompleteChatRequest>;

const GatewayProxyStreamChatRequest = z.object({
  model: z.custom<ChatModelV1>(),
  data: z.any(),
  headers: z.record(z.string()),
  query: z.record(z.string()).optional(),
});
type GatewayProxyStreamChatRequestType = z.infer<typeof GatewayProxyStreamChatRequest>;

const GatewayProxyGetEmbeddingsRequest = z.object({
  model: z.custom<EmbeddingModelV1>(),
  data: z.any(),
  headers: z.record(z.string()),
  query: z.record(z.string()).optional(),
});
type GatewayProxyGetEmbeddingsRequestType = z.infer<typeof GatewayProxyGetEmbeddingsRequest>;

const GatewayGetChatUsageCostRequest = z
  .object({
    chatUsage: z.custom<ChatUsageType>(),
    chatModelPrice: z.custom<ChatModelPriceType>().optional(),
    model: z.custom<ChatModelV1>().optional(),
  })
  .refine(
    (data) => {
      // Ensure exactly one of chatModelPrice or model is provided
      return (data.chatModelPrice !== undefined) !== (data.model !== undefined);
    },
    {
      message: "Exactly one of chatModelPrice or model must be provided, not both.",
      path: ["chatModelPrice", "model"],
    }
  );
type GatewayGetChatUsageCostRequestType = z.infer<typeof GatewayGetChatUsageCostRequest>;

const GatewayGetToolResponsesRequestOptions = z.object({
  customHeaders: z.record(z.string()).optional(),
  metadataForCallbacks: z.any().optional(),
});
type GatewayGetToolResponsesRequestOptionsType = z.infer<typeof GatewayGetToolResponsesRequestOptions>;

const GatewayGetToolResponsesRequest = z.object({
  tools: z.array(Tool()),
  messages: z.array(Message()),
  options: GatewayGetToolResponsesRequestOptions.optional(),
  abortSignal: z.instanceof(AbortSignal).optional(),
});
type GatewayGetToolResponsesRequestType = z.infer<typeof GatewayGetToolResponsesRequest>;

export {
  GatewayCompleteChatRequest,
  GatewayCompleteChatRequestOptions,
  GatewayGetChatUsageCostRequest,
  GatewayGetEmbeddingsRequest,
  GatewayGetEmbeddingsRequestOptions,
  GatewayGetToolResponsesRequest,
  GatewayOptions,
  GatewayProxyCompleteChatRequest,
  GatewayProxyGetEmbeddingsRequest,
  GatewayProxyStreamChatRequest,
  GatewayStreamChatRequest,
  GatewayStreamChatRequestOptions,
  type GatewayCompleteChatRequestOptionsType,
  type GatewayCompleteChatRequestType,
  type GatewayGetChatUsageCostRequestType,
  type GatewayGetEmbeddingsRequestOptionsType,
  type GatewayGetEmbeddingsRequestType,
  type GatewayGetToolResponsesRequestOptionsType,
  type GatewayGetToolResponsesRequestType,
  type GatewayOptionsType,
  type GatewayProxyCompleteChatRequestType,
  type GatewayProxyGetEmbeddingsRequestType,
  type GatewayProxyStreamChatRequestType,
  type GatewayStreamChatRequestOptionsType,
  type GatewayStreamChatRequestType,
};

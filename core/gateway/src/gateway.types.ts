import { Meter, Tracer } from "@opentelemetry/api";
import { z } from "zod";

import { ChatModelV1, EmbeddingModelV1 } from "@adaline/provider";
import { Config, EmbeddingRequests, Message, Tool } from "@adaline/types";

import {
  CompleteChatCallbackType,
  CompleteChatHandlerResponseType,
  GetEmbeddingsCallbackType,
  GetEmbeddingsHandlerResponseType,
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
  streamChatCallbacks: z.array(z.custom<StreamChatCallbackType>()).nonempty().optional(),
  logger: z.custom<Logger>().optional(),
  telemetry: z
    .object({
      tracer: z.custom<Tracer>().optional(),
      meter: z.custom<Meter>().optional(),
    })
    .optional(),
  analyticsEnabled: z.boolean().optional(),
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

export {
  GatewayCompleteChatRequest,
  GatewayCompleteChatRequestOptions,
  GatewayGetEmbeddingsRequest,
  GatewayGetEmbeddingsRequestOptions,
  GatewayOptions,
  GatewayStreamChatRequest,
  GatewayStreamChatRequestOptions,
  type GatewayCompleteChatRequestOptionsType,
  type GatewayCompleteChatRequestType,
  type GatewayGetEmbeddingsRequestOptionsType,
  type GatewayGetEmbeddingsRequestType,
  type GatewayOptionsType,
  type GatewayStreamChatRequestOptionsType,
  type GatewayStreamChatRequestType,
};

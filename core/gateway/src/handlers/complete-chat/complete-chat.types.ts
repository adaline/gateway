import { z } from "zod";

import { ChatModelV1 } from "@adaline/provider";
import { ChatResponse, Config, Message, Tool } from "@adaline/types";

import { GatewayError } from "../../errors";
import { Cache, HttpRequestError } from "../../plugins";

const CompleteChatHandlerRequest = z.object({
  cache: z.custom<Cache<CompleteChatHandlerResponseType>>(),
  model: z.custom<ChatModelV1>(),
  config: Config(),
  messages: z.array(Message()),
  tools: z.array(Tool()).optional(),
  enableCache: z.boolean(),
  customHeaders: z.record(z.string()).optional(),
  callbacks: z.array(z.custom<CompleteChatCallbackType>()).nonempty().optional(),
  metadataForCallbacks: z.any().optional(),
});
type CompleteChatHandlerRequestType = z.infer<typeof CompleteChatHandlerRequest>;

const CompleteChatHandlerResponse = z.object({
  request: z.object({
    config: Config(),
    messages: z.array(Message()),
    tools: z.array(Tool()).optional(),
  }),
  response: ChatResponse,
  cached: z.boolean(),
  latencyInMs: z.number().int().positive(),
  metadataForCallbacks: z.any().optional(),
  provider: z.object({
    request: z.any(),
    response: z.any(),
  }),
});
type CompleteChatHandlerResponseType = z.infer<typeof CompleteChatHandlerResponse>;

type CompleteChatCallbackType<M = any> = {
  onChatStart?: (metadata?: M) => Promise<void> | void;
  onChatCached?: (metadata?: M, response?: CompleteChatHandlerResponseType) => Promise<void> | void;
  onChatComplete?: (metadata?: M, response?: CompleteChatHandlerResponseType) => Promise<void> | void;
  onChatError?: (metadata?: M, error?: GatewayError | HttpRequestError) => Promise<void> | void;
};

export {
  CompleteChatHandlerRequest,
  CompleteChatHandlerResponse,
  type CompleteChatCallbackType,
  type CompleteChatHandlerRequestType,
  type CompleteChatHandlerResponseType,
};

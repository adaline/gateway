import { z } from "zod";

import { ChatModelV1 } from "@adaline/provider";
import { Config, Message, PartialChatResponse, Tool } from "@adaline/types";

import { GatewayError } from "../../errors";
import { HttpRequestError } from "../../plugins";

const StreamChatHandlerRequest = z.object({
  model: z.custom<ChatModelV1>(),
  config: Config(),
  messages: z.array(Message()),
  tools: z.array(Tool()).optional(),
  customHeaders: z.record(z.string()).optional(),
  callbacks: z.array(z.custom<StreamChatCallbackType>()).nonempty().optional(),
  metadataForCallbacks: z.any().optional(),
});
type StreamChatHandlerRequestType = z.infer<typeof StreamChatHandlerRequest>;

const StreamChatHandlerResponse = z.object({
  request: z.object({
    config: Config(),
    messages: z.array(Message()),
    tools: z.array(Tool()).optional(),
  }),
  response: PartialChatResponse,
  metadataForCallbacks: z.any().optional(),
  provider: z.object({
    request: z.any(),
    response: z.any(),
  }),
});
type StreamChatHandlerResponseType = z.infer<typeof StreamChatHandlerResponse>;

type StreamChatCallbackType<M = any> = {
  onStreamStart?: (metadata?: M) => Promise<void> | void;
  onStreamFirstResponse?: (metadata?: M, response?: StreamChatHandlerResponseType, chunk?: unknown) => Promise<void> | void;
  onStreamNewResponse?: (metadata?: M, response?: StreamChatHandlerResponseType, chunk?: unknown) => Promise<void> | void;
  onStreamEnd?: (metadata?: M, response?: StreamChatHandlerResponseType) => Promise<void> | void;
  onStreamError?: (metadata?: M, error?: GatewayError | HttpRequestError) => Promise<void> | void;
};

export {
  StreamChatHandlerRequest,
  StreamChatHandlerResponse,
  type StreamChatCallbackType,
  type StreamChatHandlerRequestType,
  type StreamChatHandlerResponseType,
};

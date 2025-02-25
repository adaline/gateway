import { z } from "zod";

import { ChatModelV1 } from "@adaline/provider";
import { ChatResponse } from "@adaline/types";

const ProxyCompleteChatHandlerRequest = z.object({
  model: z.custom<ChatModelV1>(),
  data: z.any(),
  headers: z.record(z.string()),
  query: z.record(z.string()).optional(),
});

type ProxyCompleteChatHandlerRequestType = z.infer<typeof ProxyCompleteChatHandlerRequest>;

const ProxyCompleteChatHandlerResponse = z.object({
  request: z.any(), // original proxy request from some SDK
  providerRequest: z.object({
    url: z.string().url(),
    headers: z.record(z.string()),
    data: z.any(),
  }), // request sent to provider
  providerResponse: z.any(), // response received from provider
  transformedResponse: ChatResponse, // response received in Adaline chat types
});
type ProxyCompleteChatHandlerResponseType = z.infer<typeof ProxyCompleteChatHandlerResponse>;

export {
  ProxyCompleteChatHandlerRequest,
  ProxyCompleteChatHandlerResponse,
  type ProxyCompleteChatHandlerRequestType,
  type ProxyCompleteChatHandlerResponseType,
};

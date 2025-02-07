import { z } from "zod";

import { ChatModelV1 } from "@adaline/provider";
import { PartialChatResponse } from "@adaline/types";

const ProxyStreamChatHandlerRequest = z.object({
  model: z.custom<ChatModelV1>(),
  data: z.any(),
  headers: z.record(z.string()),
});

type ProxyStreamChatHandlerRequestType = z.infer<typeof ProxyStreamChatHandlerRequest>;

const ProxyStreamChatHandlerResponse = z.object({
  request: z.any(), // original proxy request from some SDK
  providerRequest: z.object({
    url: z.string().url(),
    headers: z.record(z.string()),
    data: z.any(),
  }), // request sent to provider
  providerResponse: z.any(), // raw chunk from provider
  transformedResponse: z.array(PartialChatResponse), // transformed partial response
});

type ProxyStreamChatHandlerResponseType = z.infer<typeof ProxyStreamChatHandlerResponse>;

export {
  ProxyStreamChatHandlerRequest,
  ProxyStreamChatHandlerResponse,
  type ProxyStreamChatHandlerRequestType,
  type ProxyStreamChatHandlerResponseType,
};

import { z } from "zod";

import { Tool, ToolCallContent, ToolResponseContent } from "@adaline/types";

import { GatewayError } from "../../errors";
import { Cache, HttpRequestError } from "../../plugins";

const GetToolResponsesHandlerRequest = z.object({
  cache: z.custom<Cache<GetToolResponsesHandlerResponseType>>(),
  tools: z.array(Tool()),
  toolCalls: z.array(ToolCallContent()),
  enableCache: z.boolean(),
  customHeaders: z.record(z.string()).optional(),
  callbacks: z.array(z.custom<GetToolResponsesCallbackType>()).nonempty().optional(),
  metadataForCallbacks: z.any().optional(),
  abortSignal: z.instanceof(AbortSignal).optional(),
});
type GetToolResponsesHandlerRequestType = z.infer<typeof GetToolResponsesHandlerRequest>;

const GetToolResponsesHandlerResponse = z.object({
  request: z.object({
    tools: z.array(Tool()),
    toolCalls: z.array(ToolCallContent()),
  }),
  response: z.array(ToolResponseContent()),
  cached: z.boolean(),
  latencyInMs: z.number().int().positive(),
  metadataForCallbacks: z.any().optional(),
});
type GetToolResponsesHandlerResponseType = z.infer<typeof GetToolResponsesHandlerResponse>;

type GetToolResponsesCallbackType<M = any> = {
  onGetToolResponsesStart?: (metadata?: M) => Promise<void> | void;
  onGetToolResponsesCached?: (metadata?: M, response?: GetToolResponsesHandlerResponseType) => Promise<void> | void;
  onGetToolResponsesComplete?: (metadata?: M, response?: GetToolResponsesHandlerResponseType) => Promise<void> | void;
  onGetToolResponsesError?: (metadata?: M, error?: GatewayError | HttpRequestError) => Promise<void> | void;
};

export {
  GetToolResponsesHandlerRequest,
  GetToolResponsesHandlerResponse,
  type GetToolResponsesHandlerRequestType,
  type GetToolResponsesHandlerResponseType,
  type GetToolResponsesCallbackType,
};

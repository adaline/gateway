import { z } from "zod";

import { Message, Tool, ToolCallContentType, ToolResponseContent, ToolResponseContentType } from "@adaline/types";

import { GatewayError } from "../../errors";

const GetToolResponsesHandlerRequest = z.object({
  messages: z.array(Message()),
  tools: z.array(Tool()),
  customHeaders: z.record(z.string()).optional(),
  callbacks: z.array(z.custom<GetToolResponsesCallbackType>()).nonempty().optional(),
  metadataForCallbacks: z.any().optional(),
  abortSignal: z.instanceof(AbortSignal).optional(),
});
type GetToolResponsesHandlerRequestType = z.infer<typeof GetToolResponsesHandlerRequest>;

const GetToolResponsesHandlerResponse = z.object({
  toolResponses: z.record(z.string(), ToolResponseContent()),
  cached: z.boolean(),
  latencyInMs: z.number().int().positive(),
  metadataForCallbacks: z.any().optional(),
});
type GetToolResponsesHandlerResponseType = z.infer<typeof GetToolResponsesHandlerResponse>;

type GetToolResponsesCallbackType<M = any> = {
  onGetToolResponseStart?: (toolCall: ToolCallContentType, metadata?: M) => Promise<void> | void;
  onGetToolResponseCached?: (toolCall: ToolCallContentType, toolResponse: ToolResponseContentType, metadata?: M) => Promise<void> | void;
  onGetToolResponseComplete?: (toolCall: ToolCallContentType, toolResponse: ToolResponseContentType, metadata?: M) => Promise<void> | void;
  onGetToolResponseError?: (
    toolCall: ToolCallContentType, 
    toolResponse: ToolResponseContentType,
    error?: GatewayError,
    metadata?: M,
  ) => Promise<void> | void;
};

export {
  GetToolResponsesHandlerRequest,
  GetToolResponsesHandlerResponse,
  type GetToolResponsesHandlerRequestType,
  type GetToolResponsesHandlerResponseType,
  type GetToolResponsesCallbackType,
};

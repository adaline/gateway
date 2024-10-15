import { z } from "zod";

import { EmbeddingModelV1 } from "@adaline/provider";
import { Config, EmbeddingRequests, EmbeddingResponse } from "@adaline/types";

import { GatewayError } from "../../errors";
import { Cache, HttpRequestError } from "../../plugins";

const GetEmbeddingsHandlerRequest = z.object({
  cache: z.custom<Cache<GetEmbeddingsHandlerResponseType>>(),
  model: z.custom<EmbeddingModelV1>(),
  config: Config(),
  embeddingRequests: EmbeddingRequests(),
  enableCache: z.boolean(),
  customHeaders: z.record(z.string()).optional(),
  callbacks: z.array(z.custom<GetEmbeddingsCallbackType>()).nonempty().optional(),
  metadataForCallbacks: z.any().optional(),
});
type GetEmbeddingsHandlerRequestType = z.infer<typeof GetEmbeddingsHandlerRequest>;

const GetEmbeddingsHandlerResponse = z.object({
  request: z.object({
    config: Config(),
    embeddingRequests: EmbeddingRequests(),
  }),
  response: EmbeddingResponse,
  cached: z.boolean(),
  latencyInMs: z.number().int().positive(),
  metadataForCallbacks: z.any().optional(),
  provider: z.object({
    request: z.any(),
    response: z.any(),
  }),
});
type GetEmbeddingsHandlerResponseType = z.infer<typeof GetEmbeddingsHandlerResponse>;

type GetEmbeddingsCallbackType<M = any> = {
  onGetEmbeddingsStart?: (metadata?: M) => Promise<void> | void;
  onGetEmbeddingsCached?: (metadata?: M, response?: GetEmbeddingsHandlerResponseType) => Promise<void> | void;
  onGetEmbeddingsComplete?: (metadata?: M, response?: GetEmbeddingsHandlerResponseType) => Promise<void> | void;
  onGetEmbeddingsError?: (metadata?: M, error?: GatewayError | HttpRequestError) => Promise<void> | void;
};

export {
  GetEmbeddingsHandlerRequest,
  GetEmbeddingsHandlerResponse,
  type GetEmbeddingsHandlerRequestType,
  type GetEmbeddingsHandlerResponseType,
  type GetEmbeddingsCallbackType,
};

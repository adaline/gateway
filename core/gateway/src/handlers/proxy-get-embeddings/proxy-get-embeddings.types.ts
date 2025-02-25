import { z } from "zod";

import { EmbeddingModelV1 } from "@adaline/provider";
import { EmbeddingResponse } from "@adaline/types";

const ProxyGetEmbeddingsHandlerRequest = z.object({
  model: z.custom<EmbeddingModelV1>(),
  data: z.any(),
  headers: z.record(z.string()),
  query: z.record(z.string()).optional(),
});

type ProxyGetEmbeddingsHandlerRequestType = z.infer<typeof ProxyGetEmbeddingsHandlerRequest>;

const ProxyGetEmbeddingsHandlerResponse = z.object({
  request: z.any(), // Original proxy request from SDK
  providerRequest: z.object({
    url: z.string().url(),
    headers: z.record(z.string()),
    data: z.any(),
  }), // Actual request sent to provider
  providerResponse: z.any(), // Raw response from provider
  transformedResponse: EmbeddingResponse, // Response in Adaline embedding types
});

type ProxyGetEmbeddingsHandlerResponseType = z.infer<typeof ProxyGetEmbeddingsHandlerResponse>;

export {
  ProxyGetEmbeddingsHandlerRequest,
  ProxyGetEmbeddingsHandlerResponse,
  type ProxyGetEmbeddingsHandlerRequestType,
  type ProxyGetEmbeddingsHandlerResponseType,
};

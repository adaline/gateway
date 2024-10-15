import { ConfigType, EmbeddingRequestsType, EmbeddingResponseType } from "@adaline/types";

import { HeadersType, ParamsType, UrlType } from "../../types";
import { EmbeddingModelSchemaType } from "./embedding-model.schema.v1";

interface EmbeddingModelV1<MS extends EmbeddingModelSchemaType = EmbeddingModelSchemaType> {
  readonly version: "v1";
  readonly modelSchema: MS;

  getDefaultBaseUrl(): UrlType;
  getDefaultHeaders(): HeadersType;
  getDefaultParams(): ParamsType;

  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number };
  getTokenCount(requests: EmbeddingRequestsType): number;

  transformModelRequest(request: any): {
    modelName: string | undefined;
    config: ConfigType;
    embeddingRequests: EmbeddingRequestsType;
  };

  transformConfig(config: ConfigType, requests?: EmbeddingRequestsType): ParamsType;
  transformEmbeddingRequests(requests: EmbeddingRequestsType): ParamsType;

  getGetEmbeddingsUrl(config?: ConfigType, requests?: EmbeddingRequestsType): Promise<UrlType>;
  getGetEmbeddingsHeaders(config?: ConfigType, requests?: EmbeddingRequestsType): Promise<HeadersType>;
  getGetEmbeddingsData(config: ConfigType, requests: EmbeddingRequestsType): Promise<ParamsType>;
  transformGetEmbeddingsResponse(response: any): EmbeddingResponseType;
}

export { type EmbeddingModelV1 };

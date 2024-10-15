import { z } from "zod";

import {
  EmbeddingModelSchemaType,
  EmbeddingModelV1,
  HeadersType,
  InvalidConfigError,
  InvalidEmbeddingRequestsError,
  InvalidModelRequestError,
  ModelError,
  ModelResponseError,
  ParamsType,
  removeUndefinedEntries,
  UrlType,
} from "@adaline/provider";
import {
  Config,
  ConfigType,
  EmbeddingRequests,
  EmbeddingRequestsType,
  EmbeddingResponseType,
  EmbeddingTextModalityLiteral,
  FloatEmbeddingLiteral,
  FloatEmbeddingType,
} from "@adaline/types";

import { Vertex } from "../../provider/provider.vertex";
import { VertexEmbeddingRequest, VertexGetEmbeddingsResponse } from "./types";

const BaseEmbeddingModelOptions = z.object({
  accessToken: z.string(),
  modelName: z.string(),
  baseUrl: z.string().url().optional(),
  location: z.string().optional(),
  projectId: z.string().optional(),
  publisher: z.string().optional(),
});
type BaseEmbeddingModelOptionsType = z.infer<typeof BaseEmbeddingModelOptions>;

class BaseEmbeddingModel implements EmbeddingModelV1<EmbeddingModelSchemaType> {
  readonly version = "v1" as const;
  modelSchema: EmbeddingModelSchemaType;
  modelName: string;

  private readonly accessToken: string;
  private readonly baseUrl: string;
  private readonly getEmbeddingsUrl: string;
  private readonly location: string | undefined;
  private readonly projectId: string | undefined;
  private readonly publisher: string | undefined;

  constructor(modelSchema: EmbeddingModelSchemaType, options: BaseEmbeddingModelOptionsType) {
    const parsedOptions = BaseEmbeddingModelOptions.parse(options);
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.accessToken = parsedOptions.accessToken;

    let baseUrl: string | undefined;
    if (parsedOptions.baseUrl) {
      baseUrl = parsedOptions.baseUrl;
    } else if (parsedOptions.location && parsedOptions.projectId) {
      baseUrl = Vertex.baseUrl(parsedOptions.location, parsedOptions.projectId, parsedOptions.publisher);
    } else {
      throw new ModelError({
        info: "Either 'baseUrl' must be provided or 'location' and 'projectId' must be provided",
        cause: new Error("Either 'baseUrl' must be provided or 'location' and 'projectId' must be provided"),
      });
    }

    this.baseUrl = baseUrl;
    this.getEmbeddingsUrl = `${this.baseUrl}/models/${parsedOptions.modelName}:predict`;
    this.location = parsedOptions.location;
    this.projectId = parsedOptions.projectId;
  }

  getDefaultBaseUrl(): UrlType {
    return this.baseUrl;
  }

  getDefaultHeaders(): HeadersType {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  getDefaultParams(): ParamsType {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number } {
    return { shouldRetry: false, delayMs: 0 };
  }

  getTokenCount(requests: EmbeddingRequestsType): number {
    return requests.requests.reduce((acc, request) => acc + request.length, 0);
  }

  transformModelRequest(request: any): {
    modelName: string | undefined;
    config: ConfigType;
    embeddingRequests: EmbeddingRequestsType;
  } {
    const safeRequest = VertexEmbeddingRequest.safeParse(request);
    if (!safeRequest.success) {
      throw new InvalidModelRequestError({ info: "Invalid model request", cause: safeRequest.error });
    }

    const parsedRequest = safeRequest.data;

    const modelName = parsedRequest.model;

    const _config = {
      autoTruncate: parsedRequest.parameters?.auto_truncate || parsedRequest.parameters?.autoTruncate,
      dimensions: parsedRequest.parameters?.output_dimensionality || parsedRequest.parameters?.outputDimensionality,
    };
    const config = Config().parse(removeUndefinedEntries(_config));

    const embeddingRequests: EmbeddingRequestsType = {
      modality: EmbeddingTextModalityLiteral,
      requests: parsedRequest.instances.map((instance) => instance.content),
    };

    return {
      modelName,
      config,
      embeddingRequests,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transformConfig(config: ConfigType, requests?: EmbeddingRequestsType): ParamsType {
    const _parsedConfig = this.modelSchema.config.schema.safeParse(config);
    if (!_parsedConfig.success) {
      throw new InvalidConfigError({
        info: `Invalid config for model : '${this.modelName}'`,
        cause: _parsedConfig.error,
      });
    }

    const parsedConfig = _parsedConfig.data as ConfigType;
    Object.keys(parsedConfig as ConfigType).forEach((key) => {
      if (!this.modelSchema.config.def[key]) {
        throw new InvalidConfigError({
          info: `Invalid config for model : '${this.modelName}'`,
          cause: new Error(`Invalid config key : '${key}', 
            available keys : [${Object.keys(this.modelSchema.config.def).join(", ")}]`),
        });
      }
    });

    const transformedConfig = Object.keys(parsedConfig).reduce((acc, key) => {
      const def = this.modelSchema.config.def[key];
      const paramKey = def.param;
      const paramValue = parsedConfig[key];
      acc[paramKey] = paramValue;
      return acc;
    }, {} as ParamsType);

    return {
      parameters: transformedConfig,
    };
  }

  transformEmbeddingRequests(requests: EmbeddingRequestsType): ParamsType {
    const _parsedRequests = EmbeddingRequests().safeParse(requests);
    if (!_parsedRequests.success) {
      throw new InvalidEmbeddingRequestsError({ info: "Invalid embedding requests", cause: _parsedRequests.error });
    }

    if (requests.modality !== EmbeddingTextModalityLiteral) {
      throw new InvalidEmbeddingRequestsError({
        info: `Invalid embedding requests for model : '${this.modelName}'`,
        cause: new Error(`Only '${EmbeddingTextModalityLiteral}' modality is supported for model : '${this.modelName}'`),
      });
    }

    const instances = _parsedRequests.data.requests.map((request) => {
      return {
        content: request as string,
      };
    });

    return {
      instances,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getGetEmbeddingsUrl(config?: ConfigType, requests?: EmbeddingRequestsType): Promise<UrlType> {
    return new Promise((resolve) => {
      resolve(this.getEmbeddingsUrl);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getGetEmbeddingsHeaders(config?: ConfigType, requests?: EmbeddingRequestsType): Promise<HeadersType> {
    return new Promise((resolve) => {
      resolve(this.getDefaultHeaders());
    });
  }

  async getGetEmbeddingsData(config: ConfigType, requests: EmbeddingRequestsType): Promise<ParamsType> {
    return new Promise((resolve) => {
      if (requests.requests.length === 0) {
        throw new InvalidEmbeddingRequestsError({
          info: `Invalid embedding requests for model : '${this.modelName}'`,
          cause: new Error("requests cannot be empty"),
        });
      }

      resolve({
        ...this.getDefaultParams(),
        ...this.transformConfig(config),
        ...this.transformEmbeddingRequests(requests),
      });
    });
  }

  transformGetEmbeddingsResponse(response: any): EmbeddingResponseType {
    const safe = VertexGetEmbeddingsResponse.safeParse(response);
    if (safe.success) {
      const parsedResponse = safe.data;
      const embeddings = parsedResponse.predictions.map((prediction, index) => {
        return {
          index,
          embedding: prediction.embeddings.values,
        } as FloatEmbeddingType;
      });

      return {
        encodingFormat: FloatEmbeddingLiteral,
        embeddings: embeddings,
      } as EmbeddingResponseType;
    }

    throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
  }
}

export { BaseEmbeddingModel, BaseEmbeddingModelOptions, type BaseEmbeddingModelOptionsType };

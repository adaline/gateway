import { z } from "zod";

import {
  EmbeddingModelSchemaType,
  EmbeddingModelV1,
  HeadersType,
  InvalidConfigError,
  InvalidEmbeddingRequestsError,
  InvalidModelRequestError,
  ModelResponseError,
  ParamsType,
  removeUndefinedEntries,
  UrlType,
  urlWithoutTrailingSlash,
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

import { GoogleEmbeddingRequest, GoogleEmbeddingRequestInputType, GoogleGetEmbeddingsResponse } from "./types";

const BaseEmbeddingModelOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().url(),
  getEmbeddingsUrl: z.string().url().optional(),
});
type BaseEmbeddingModelOptionsType = z.infer<typeof BaseEmbeddingModelOptions>;

class BaseEmbeddingModel implements EmbeddingModelV1<EmbeddingModelSchemaType> {
  readonly version = "v1" as const;
  modelSchema: EmbeddingModelSchemaType;
  readonly modelName: string;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly getEmbeddingsUrl: string;

  constructor(modelSchema: EmbeddingModelSchemaType, options: BaseEmbeddingModelOptionsType) {
    const parsedOptions = BaseEmbeddingModelOptions.parse(options);
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.apiKey = parsedOptions.apiKey;
    this.baseUrl = urlWithoutTrailingSlash(parsedOptions.baseUrl);
    this.getEmbeddingsUrl = urlWithoutTrailingSlash(
      parsedOptions.getEmbeddingsUrl || `${this.baseUrl}/models/${this.modelName}:batchEmbedContents?key=${this.apiKey}`
    );
  }

  getDefaultBaseUrl(): UrlType {
    return this.baseUrl;
  }

  getDefaultHeaders(): HeadersType {
    return {
      "Content-Type": "application/json",
    };
  }

  getDefaultParams(): ParamsType {
    return {
      model: this.modelName,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number } {
    return { shouldRetry: false, delayMs: 0 };
  }

  // TODO: unused method, not tested
  getTokenCount(requests: EmbeddingRequestsType): number {
    return requests.requests.reduce((acc, request) => acc + request.length, 0);
  }

  transformModelRequest(request: any): {
    modelName: string | undefined;
    config: ConfigType;
    embeddingRequests: EmbeddingRequestsType;
  } {
    const safeRequest = GoogleEmbeddingRequest.safeParse(request);
    if (!safeRequest.success) {
      throw new InvalidModelRequestError({ info: "Invalid model request", cause: safeRequest.error });
    }

    const parsedRequest = safeRequest.data;

    const modelName = parsedRequest.model;

    const _config = {
      outputDimensionality: parsedRequest.outputDimensionality,
    };
    const config = Config().parse(removeUndefinedEntries(_config));

    const embeddingRequests: EmbeddingRequestsType = {
      modality: EmbeddingTextModalityLiteral,
      requests: parsedRequest.requests.reduce((acc, request) => {
        acc.push(...request.content.parts.map((p) => p.text));
        return acc;
      }, [] as string[]),
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

    return transformedConfig;
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

    const _requests: GoogleEmbeddingRequestInputType[] = _parsedRequests.data.requests.map((request) => {
      return {
        model: `models/${this.modelName}`,
        content: { parts: [{ text: request as string }] },
      };
    });

    return {
      requests: _requests,
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
      const _config = this.transformConfig(config);
      const _requests = this.transformEmbeddingRequests(requests);

      if (requests.requests.length === 0) {
        throw new InvalidEmbeddingRequestsError({
          info: `Invalid embedding requests for model : '${this.modelName}'`,
          cause: new Error("requests cannot be empty"),
        });
      }

      if (_config.outputDimensionality) {
        (_requests as any).requests.forEach((request: any) => {
          request.outputDimensionality = _config.outputDimensionality;
        });
        delete _config.outputDimensionality;
      }

      resolve({
        ...this.getDefaultParams(),
        ..._config,
        ..._requests,
      });
    });
  }

  transformGetEmbeddingsResponse(response: any): EmbeddingResponseType {
    const safe = GoogleGetEmbeddingsResponse.safeParse(response);
    if (safe.success) {
      const parsedResponse = safe.data;
      const embeddings = parsedResponse.embeddings.map((embedding, index) => {
        return {
          index,
          embedding: embedding.values,
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

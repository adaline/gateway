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
  Base64EmbeddingLiteral,
  Base64EmbeddingType,
  Config,
  ConfigType,
  EmbeddingRequests,
  EmbeddingRequestsType,
  EmbeddingResponseType,
  EmbeddingTextModalityLiteral,
  FloatEmbeddingLiteral,
  FloatEmbeddingType,
} from "@adaline/types";

import { Anthropic } from "../../provider/provider.anthropic";
import { AnthropicEmbeddingRequest, AnthropicGetEmbeddingsResponse } from "./types";

const BaseEmbeddingModelOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
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
    this.baseUrl = urlWithoutTrailingSlash(Anthropic.embeddingBaseUrl);
    this.getEmbeddingsUrl = urlWithoutTrailingSlash(parsedOptions.getEmbeddingsUrl || `${this.baseUrl}/embeddings`);
  }

  getDefaultBaseUrl(): UrlType {
    return this.baseUrl;
  }

  getDefaultHeaders(): HeadersType {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  getDefaultParams(): ParamsType {
    return {
      model: this.modelName,
    };
  }

  // TODO: unused method, not tested
  getTokenCount(requests: EmbeddingRequestsType): number {
    return requests.requests.reduce((acc, request) => acc + request.length, 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number } {
    const delayMs = 0;
    const shouldRetry = true;
    return { shouldRetry, delayMs };
  }

  transformModelRequest(request: any): {
    modelName: string | undefined;
    config: ConfigType;
    embeddingRequests: EmbeddingRequestsType;
  } {
    const safeRequest = AnthropicEmbeddingRequest.safeParse(request);
    if (!safeRequest.success) {
      throw new InvalidModelRequestError({ info: "Invalid model request", cause: safeRequest.error });
    }

    const parsedRequest = safeRequest.data;

    const modelName = parsedRequest.model;

    const _config = {
      encodingFormat: parsedRequest.encoding_format,
      inputType: parsedRequest.input_type,
      truncation: parsedRequest.truncation,
    };

    const config = Config().parse(removeUndefinedEntries(_config));

    let embeddingRequests: EmbeddingRequestsType;
    if (typeof parsedRequest.input === "string") {
      embeddingRequests = {
        modality: EmbeddingTextModalityLiteral,
        requests: [parsedRequest.input],
      };
    } else {
      embeddingRequests = {
        modality: EmbeddingTextModalityLiteral,
        requests: parsedRequest.input,
      };
    }

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

    // TODO: move to model schema
    if (_parsedRequests.data.requests.length > 128) {
      throw new InvalidEmbeddingRequestsError({
        info: `Invalid embedding requests for model : '${this.modelName}'`,
        cause: new Error(`Max requests for model : '${this.modelName}' is 128`),
      });
    }

    const parsedRequests = _parsedRequests.data as EmbeddingRequestsType;
    return {
      input: parsedRequests.requests,
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
      resolve({
        ...this.getDefaultParams(),
        ...this.transformConfig(config, requests),
        ...this.transformEmbeddingRequests(requests),
      });
    });
  }

  transformGetEmbeddingsResponse(response: any): EmbeddingResponseType {
    let encodingFormat: typeof Base64EmbeddingLiteral | typeof FloatEmbeddingLiteral;
    const safe = AnthropicGetEmbeddingsResponse.safeParse(response);
    if (safe.success) {
      const parsedResponse = safe.data;
      encodingFormat = typeof parsedResponse.data[0].embedding === "string" ? Base64EmbeddingLiteral : FloatEmbeddingLiteral;
      const embeddings = parsedResponse.data.map((item) => {
        if (typeof item.embedding === "string") {
          return {
            index: item.index,
            embedding: item.embedding,
          } as Base64EmbeddingType;
        } else {
          return {
            index: item.index,
            embedding: item.embedding,
          } as FloatEmbeddingType;
        }
      });
      return {
        encodingFormat: encodingFormat,
        embeddings: embeddings,
        usage: {
          totalTokens: parsedResponse.usage.total_tokens,
        },
      } as EmbeddingResponseType;
    }

    throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
  }
}

export { BaseEmbeddingModel, BaseEmbeddingModelOptions, type BaseEmbeddingModelOptionsType };

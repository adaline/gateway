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
  EmbeddingTokenModalityLiteral,
  FloatEmbeddingLiteral,
  FloatEmbeddingType,
} from "@adaline/types";

import { OpenAIEmbeddingRequest, OpenAIGetEmbeddingsResponse } from "./types";

import { OpenAI } from "./../../provider/provider.openai";

const BaseEmbeddingModelOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().url().optional(),
  getEmbeddingsUrl: z.string().url().optional(),
});
type BaseEmbeddingModelOptionsType = z.infer<typeof BaseEmbeddingModelOptions>;

class BaseEmbeddingModel implements EmbeddingModelV1<EmbeddingModelSchemaType> {
  readonly version = "v1" as const;
  modelSchema: EmbeddingModelSchemaType;
  modelName: string;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly getEmbeddingsUrl: string;

  constructor(modelSchema: EmbeddingModelSchemaType, options: BaseEmbeddingModelOptionsType) {
    const parsedOptions = BaseEmbeddingModelOptions.parse(options);
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.apiKey = parsedOptions.apiKey;
    this.baseUrl = urlWithoutTrailingSlash(parsedOptions.baseUrl || OpenAI.baseUrl);
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
      model: this.modelSchema.name,
    };
  }

  // x-ratelimit-limit-requests	The maximum number of requests that are permitted before exhausting the rate limit.
  // x-ratelimit-limit-tokens	The maximum number of tokens that are permitted before exhausting the rate limit.
  // x-ratelimit-remaining-requests The remaining number of requests that are permitted before exhausting the rate limit.
  // x-ratelimit-remaining-tokens	The remaining number of tokens that are permitted before exhausting the rate limit.
  // x-ratelimit-reset-requests	The time until the rate limit (based on requests) resets to its initial state.
  // x-ratelimit-reset-tokens	The time until the rate limit (based on tokens) resets to its initial state.
  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number } {
    // parse duration from header value of format "6m0s" or "21s" or "41ms" or "2s81ms" or "5h50m30ms" and such
    const parseDuration = (duration: string): number => {
      const regex = /(\d+)(h|m|s|ms)/g;
      const timeUnits: { [unit: string]: number } = {
        h: 3600000, // 1 hour = 60 * 60 * 1000 ms
        m: 60000, // 1 minute = 60 * 1000 ms
        s: 1000, // 1 second = 1000 ms
        ms: 1, // milliseconds
      };

      let match;
      let totalMs = 0;
      while ((match = regex.exec(duration)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];
        totalMs += value * timeUnits[unit];
      }

      return totalMs;
    };

    let resetRequestsDelayMs = 0;
    let resetTokensDelayMs = 0;
    const shouldRetry = true;
    if (responseHeaders["x-ratelimit-reset-requests"]) {
      resetRequestsDelayMs = parseDuration(responseHeaders["x-ratelimit-reset-requests"]);
    }
    if (responseHeaders["x-ratelimit-reset-tokens"]) {
      resetTokensDelayMs = parseDuration(responseHeaders["x-ratelimit-reset-tokens"]);
    }

    // if rate limited by requests, then it's reset must be the higher of two and visa versa
    const delayMs = Math.max(resetRequestsDelayMs, resetTokensDelayMs);
    return { shouldRetry, delayMs };
  }

  getTokenCount(requests: EmbeddingRequestsType): number {
    return requests.requests.reduce((acc, request) => acc + request.length, 0);
  }

  transformModelRequest(request: any): {
    modelName: string | undefined;
    config: ConfigType;
    embeddingRequests: EmbeddingRequestsType;
  } {
    const safeRequest = OpenAIEmbeddingRequest.safeParse(request);
    if (!safeRequest.success) {
      throw new InvalidModelRequestError({ info: "Invalid model request", cause: safeRequest.error });
    }

    const parsedRequest = safeRequest.data;

    const modelName = parsedRequest.model;

    const _config = {
      encodingFormat: parsedRequest.encoding_format,
      dimensions: parsedRequest.dimensions,
    };
    const config = Config().parse(removeUndefinedEntries(_config));

    let embeddingRequests: EmbeddingRequestsType;
    let embeddingFormat: typeof EmbeddingTextModalityLiteral | typeof EmbeddingTokenModalityLiteral;
    if (typeof parsedRequest.input === "string") {
      embeddingFormat = EmbeddingTextModalityLiteral;
    } else {
      if (typeof parsedRequest.input[0] === "string") {
        embeddingFormat = EmbeddingTextModalityLiteral;
      } else {
        embeddingFormat = EmbeddingTokenModalityLiteral;
      }
    }

    if (embeddingFormat === EmbeddingTextModalityLiteral) {
      if (typeof parsedRequest.input === "string") {
        embeddingRequests = {
          modality: embeddingFormat,
          requests: [parsedRequest.input],
        };
      } else {
        embeddingRequests = {
          modality: embeddingFormat,
          requests: parsedRequest.input as string[],
        };
      }
    } else {
      if (typeof parsedRequest.input[0] === "number") {
        embeddingRequests = {
          modality: embeddingFormat,
          requests: [parsedRequest.input as number[]],
        };
      } else {
        embeddingRequests = {
          modality: embeddingFormat,
          requests: parsedRequest.input as number[][],
        };
      }
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
        info: `Invalid config for model : '${this.modelSchema.name}'`,
        cause: _parsedConfig.error,
      });
    }

    const parsedConfig = _parsedConfig.data as ConfigType;
    Object.keys(parsedConfig as ConfigType).forEach((key) => {
      if (!this.modelSchema.config.def[key]) {
        throw new InvalidConfigError({
          info: `Invalid config for model : '${this.modelSchema.name}'`,
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

    // Note from OpenAI API Reference:
    // The input must not exceed the max input tokens for the model (8192 tokens for text-embedding-ada-002),
    // cannot be an empty string, and any array must be 2048 dimensions or less.
    // TODO: add max tokens check in requests based on model schema when token calculation is accurate

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
    const safe = OpenAIGetEmbeddingsResponse.safeParse(response);
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

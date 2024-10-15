import { ChatModelSchemaType, ChatModelV1, EmbeddingModelSchemaType, EmbeddingModelV1, ProviderV1 } from "@adaline/provider";

import {
  BaseChatModelOpenAI,
  BaseChatModelOptions,
  BaseChatModelSchema,
  BaseEmbeddingModelOpenAI,
  BaseEmbeddingModelOptions,
  BaseEmbeddingModelSchema,
  type BaseChatModelOptionsType,
  type BaseEmbeddingModelOptionsType,
} from "../models";

const ProviderLiteral = "azure";
class Azure<C extends BaseChatModelOptionsType, E extends BaseEmbeddingModelOptionsType> implements ProviderV1<C, E> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;
  static readonly azureUrl = (resourceName: string, provider: string): string => `https://${resourceName}.${provider}.azure.com`;

  chatModelLiterals(): string[] {
    return ["__base__"];
  }

  chatModelSchemas(): Record<string, ChatModelSchemaType> {
    return {
      __base__: BaseChatModelSchema,
    };
  }

  chatModel(options: C): ChatModelV1 {
    const model = BaseChatModelOpenAI;
    const parsedOptions = BaseChatModelOptions.parse(options);
    return new model(BaseChatModelSchema, parsedOptions);
  }

  embeddingModelLiterals(): string[] {
    return ["__base__"];
  }

  embeddingModelSchemas(): Record<string, EmbeddingModelSchemaType> {
    return {
      __base__: BaseEmbeddingModelSchema,
    };
  }

  embeddingModel(options: E): EmbeddingModelV1 {
    const model = BaseEmbeddingModelOpenAI;
    const parsedOptions = BaseEmbeddingModelOptions.parse(options);
    return new model(BaseEmbeddingModelSchema, parsedOptions);
  }
}

export { Azure };

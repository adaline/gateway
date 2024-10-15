import { 
  ChatModelSchemaType, 
  ChatModelV1, 
  EmbeddingModelSchemaType, 
  EmbeddingModelV1, 
  ProviderV1 
} from "@adaline/provider";

import {
  BaseChatModel,
  BaseChatModelOptions,
  BaseChatModelSchema,
  BaseEmbeddingModel,
  BaseEmbeddingModelOptions,
  BaseEmbeddingModelSchema,
  type BaseChatModelOptionsType,
  type BaseEmbeddingModelOptionsType,
} from "../models";

const ProviderLiteral = "together-ai";
class TogetherAI<
  C extends BaseChatModelOptionsType,
  E extends BaseEmbeddingModelOptionsType
> implements ProviderV1<C, E> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;
  static readonly baseUrl = "https://api.together.xyz/v1";

  chatModelLiterals(): string[] {
    return ["__base__"];
  }

  chatModelSchemas(): Record<string, ChatModelSchemaType> {
    return {
      "__base__": BaseChatModelSchema,
    };
  }

  chatModel(options: C): ChatModelV1 {
    const model = BaseChatModel;
    const parsedOptions = BaseChatModelOptions.parse(options);
    return new model(BaseChatModelSchema, parsedOptions);
  }

  embeddingModelLiterals(): string[] {
    return ["__base__"];
  }

  embeddingModelSchemas(): Record<string, EmbeddingModelSchemaType> {
    return {
      "__base__": BaseEmbeddingModelSchema,
    };
  }

  embeddingModel(options: E): EmbeddingModelV1 {
    const model = BaseEmbeddingModel;
    const parsedOptions = BaseEmbeddingModelOptions.parse(options);
    return new model(BaseEmbeddingModelSchema, parsedOptions);
  }
}

export { TogetherAI };

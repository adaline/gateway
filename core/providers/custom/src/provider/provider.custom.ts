import { z } from "zod";

import { ChatModelSchemaType, ChatModelV1, EmbeddingModelSchemaType, EmbeddingModelV1, ProviderError, ProviderV1 } from "@adaline/provider";

import { BaseChatModelOpenAI, BaseChatModelOptions, BaseChatModelSchema, type BaseChatModelOptionsType } from "../models";

const ProviderLiteral = "custom";
class Custom<C extends BaseChatModelOptionsType, E extends Record<string, any> = Record<string, any>> implements ProviderV1<C, E> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;
  static readonly customUrl = (baseURL: string): string => `${baseURL}`;

  private readonly embeddingModelFactories: Record<
    string,
    {
      model: { new (options: any): EmbeddingModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: EmbeddingModelSchemaType;
    }
  > = {};

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
    return Object.keys(this.embeddingModelFactories);
  }

  embeddingModelSchemas(): Record<string, EmbeddingModelSchemaType> {
    return Object.keys(this.embeddingModelFactories).reduce(
      (acc, key) => {
        acc[key] = this.embeddingModelFactories[key].modelSchema;
        return acc;
      },
      {} as Record<string, EmbeddingModelSchemaType>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  embeddingModel(options: E): EmbeddingModelV1 {
    throw new ProviderError({
      info: "Custom embedding models not supported yet",
      cause: new Error("Custom embedding models not supported yet"),
    });
  }
}

export { Custom };

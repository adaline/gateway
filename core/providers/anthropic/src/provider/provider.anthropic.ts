import { z } from "zod";

import { ChatModelSchemaType, ChatModelV1, EmbeddingModelSchemaType, EmbeddingModelV1, ProviderError, ProviderV1 } from "@adaline/provider";

import * as Models from "./../models";

const ProviderLiteral = "anthropic";
class Anthropic<C extends Models.BaseChatModelOptionsType, E extends Models.BaseEmbeddingModelOptionsType> implements ProviderV1<C, E> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;
  static readonly chatBaseUrl: string = "https://api.anthropic.com/v1";
  static readonly embeddingBaseUrl: string = "https://api.anthropic.com/v1";

  private readonly chatModelFactories: Record<
    string,
    {
      model: { new (options: any): ChatModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: ChatModelSchemaType;
    }
  > = {
    [Models.Claude3Haiku20240307Literal]: {
      model: Models.Claude3Haiku20240307,
      modelOptions: Models.Claude3Haiku20240307Options,
      modelSchema: Models.Claude3Haiku20240307Schema,
    },
    [Models.Claude3Sonnet20240229Literal]: {
      model: Models.Claude3Sonnet20240229,
      modelOptions: Models.Claude3Sonnet20240229Options,
      modelSchema: Models.Claude3Sonnet20240229Schema,
    },
    [Models.Claude3Opus20240229Literal]: {
      model: Models.Claude3Opus20240229,
      modelOptions: Models.Claude3Opus20240229Options,
      modelSchema: Models.Claude3Opus20240229Schema,
    },
    [Models.Claude3_5Sonnet20240620Literal]: {
      model: Models.Claude3_5Sonnet20240620,
      modelOptions: Models.Claude3_5Sonnet20240620Options,
      modelSchema: Models.Claude3_5Sonnet20240620Schema,
    },
  };

  private readonly embeddingModelFactories: Record<
    string,
    {
      model: { new (options: any): EmbeddingModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: EmbeddingModelSchemaType;
    }
  > = {
    [Models.Voyage3Literal]: {
      model: Models.Voyage3,
      modelOptions: Models.Voyage3Options,
      modelSchema: Models.Voyage3Schema,
    },
    [Models.Voyage3LiteLiteral]: {
      model: Models.Voyage3Lite,
      modelOptions: Models.Voyage3LiteOptions,
      modelSchema: Models.Voyage3LiteSchema,
    },
    [Models.VoyageCode2Literal]: {
      model: Models.VoyageCode2,
      modelOptions: Models.VoyageCode2Options,
      modelSchema: Models.VoyageCode2Schema,
    },
    [Models.VoyageLaw2Literal]: {
      model: Models.VoyageLaw2,
      modelOptions: Models.VoyageLaw2Options,
      modelSchema: Models.VoyageLaw2Schema,
    },
    [Models.VoyageMultilingual2Literal]: {
      model: Models.VoyageMultilingual2,
      modelOptions: Models.VoyageMultilingual2Options,
      modelSchema: Models.VoyageMultilingual2Schema,
    },
    [Models.VoyageFinance2Literal]: {
      model: Models.VoyageFinance2,
      modelOptions: Models.VoyageFinance2Options,
      modelSchema: Models.VoyageFinance2Schema,
    },
  };

  chatModelLiterals(): string[] {
    return Object.keys(this.chatModelFactories);
  }

  chatModelSchemas(): Record<string, ChatModelSchemaType> {
    return Object.keys(this.chatModelFactories).reduce(
      (acc, key) => {
        acc[key] = this.chatModelFactories[key].modelSchema;
        return acc;
      },
      {} as Record<string, ChatModelSchemaType>
    );
  }

  chatModel(options: C): ChatModelV1 {
    const modelName = options.modelName;
    if (!(modelName in this.chatModelFactories)) {
      throw new ProviderError({
        info: `Anthropic chat model: ${modelName} not found`,
        cause: new Error(`Anthropic chat model: ${modelName} not found, available chat models: 
          ${this.chatModelLiterals().join(", ")}`),
      });
    }

    const model = this.chatModelFactories[modelName].model;
    const parsedOptions = this.chatModelFactories[modelName].modelOptions.parse(options);
    return new model(parsedOptions);
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

  embeddingModel(options: E): EmbeddingModelV1 {
    const modelName = options.modelName;
    if (!(modelName in this.embeddingModelFactories)) {
      throw new ProviderError({
        info: `Anthropic embedding model: ${modelName} not found`,
        cause: new Error(`Anthropic embedding model: ${modelName} not found, available embedding models: 
          ${this.embeddingModelLiterals().join(", ")}`),
      });
    }

    const model = this.embeddingModelFactories[modelName].model;
    const parsedOptions = this.embeddingModelFactories[modelName].modelOptions.parse(options);
    return new model(parsedOptions);
  }
}

export { Anthropic, ProviderLiteral };

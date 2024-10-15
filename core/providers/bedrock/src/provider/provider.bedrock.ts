import { z } from "zod";

import { ChatModelSchemaType, ChatModelV1, EmbeddingModelSchemaType, EmbeddingModelV1, ProviderError, ProviderV1 } from "@adaline/provider";

import * as Models from "../models";

const ProviderLiteral = "bedrock";
class Bedrock<C extends Models.BaseChatModelOptionsType, E extends Record<string, any> = Record<string, any>> implements ProviderV1<C, E> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;
  static readonly awsService = "bedrock";
  static readonly awsUrl = (awsRegion: string): string => `https://bedrock.${awsRegion}.amazonaws.com`;

  private readonly chatModelFactories: Record<
    string,
    {
      model: { new (options: any): ChatModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: ChatModelSchemaType;
    }
  > = {
    [Models.BedrockClaude3Haiku20240307Literal]: {
      model: Models.BedrockClaude3Haiku20240307,
      modelOptions: Models.BedrockClaude3Haiku20240307Options,
      modelSchema: Models.BedrockClaude3Haiku20240307Schema,
    },
  };

  private readonly embeddingModelFactories: Record<
    string,
    {
      model: { new (options: any): EmbeddingModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: EmbeddingModelSchemaType;
    }
  > = {};

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
        info: `Bedrock chat model: ${modelName} not found`,
        cause: new Error(`Bedrock chat model: ${modelName} not found, available chat models: 
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  embeddingModel(options: E): EmbeddingModelV1 {
    throw new ProviderError({
      info: "Adaline Bedrock provider does not support embedding models yet",
      cause: new Error("Adaline Bedrock provider does not support embedding models yet"),
    });
  }
}

export { Bedrock };

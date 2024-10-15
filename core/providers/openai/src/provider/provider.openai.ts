import { z } from "zod";

import { ChatModelSchemaType, ChatModelV1, EmbeddingModelSchemaType, EmbeddingModelV1, ProviderError, ProviderV1 } from "@adaline/provider";

import * as Models from "../models";

const ProviderLiteral = "openai";
class OpenAI<C extends Models.BaseChatModelOptionsType, E extends Models.BaseEmbeddingModelOptionsType> implements ProviderV1<C, E> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;
  static readonly baseUrl = "https://api.openai.com/v1";

  private readonly chatModelFactories: Record<
    string,
    {
      model: { new (options: any): ChatModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: ChatModelSchemaType;
    }
  > = {
    [Models.GPT_3_5_TurboLiteral]: {
      model: Models.GPT_3_5_Turbo,
      modelOptions: Models.GPT_3_5_TurboOptions,
      modelSchema: Models.GPT_3_5_TurboSchema,
    },
    [Models.GPT_3_5_Turbo_0125Literal]: {
      model: Models.GPT_3_5_Turbo_0125,
      modelOptions: Models.GPT_3_5_Turbo_0125Options,
      modelSchema: Models.GPT_3_5_Turbo_0125Schema,
    },
    [Models.GPT_3_5_Turbo_1106Literal]: {
      model: Models.GPT_3_5_Turbo_1106,
      modelOptions: Models.GPT_3_5_Turbo_1106Options,
      modelSchema: Models.GPT_3_5_Turbo_1106Schema,
    },
    [Models.GPT_4_0125_PreviewLiteral]: {
      model: Models.GPT_4_0125_Preview,
      modelOptions: Models.GPT_4_0125_PreviewOptions,
      modelSchema: Models.GPT_4_0125_PreviewSchema,
    },
    [Models.GPT_4_0613Literal]: {
      model: Models.GPT_4_0613,
      modelOptions: Models.GPT_4_0613Options,
      modelSchema: Models.GPT_4_0613Schema,
    },
    [Models.GPT_4_1106_PreviewLiteral]: {
      model: Models.GPT_4_1106_Preview,
      modelOptions: Models.GPT_4_1106_PreviewOptions,
      modelSchema: Models.GPT_4_1106_PreviewSchema,
    },
    [Models.GPT_4_Turbo_2024_04_09Literal]: {
      model: Models.GPT_4_Turbo_2024_04_09,
      modelOptions: Models.GPT_4_Turbo_2024_04_09Options,
      modelSchema: Models.GPT_4_Turbo_2024_04_09Schema,
    },
    [Models.GPT_4_Turbo_PreviewLiteral]: {
      model: Models.GPT_4_Turbo_Preview,
      modelOptions: Models.GPT_4_Turbo_PreviewOptions,
      modelSchema: Models.GPT_4_Turbo_PreviewSchema,
    },
    [Models.GPT_4_TurboLiteral]: {
      model: Models.GPT_4_Turbo,
      modelOptions: Models.GPT_4_TurboOptions,
      modelSchema: Models.GPT_4_TurboSchema,
    },
    [Models.GPT_4Literal]: {
      model: Models.GPT_4,
      modelOptions: Models.GPT_4Options,
      modelSchema: Models.GPT_4Schema,
    },
    [Models.GPT_4o_2024_08_06Literal]: {
      model: Models.GPT_4o_2024_08_06,
      modelOptions: Models.GPT_4o_2024_08_06Options,
      modelSchema: Models.GPT_4o_2024_08_06Schema,
    },
    [Models.GPT_4o_MiniLiteral]: {
      model: Models.GPT_4o_Mini,
      modelOptions: Models.GPT_4o_MiniOptions,
      modelSchema: Models.GPT_4o_MiniSchema,
    },
    [Models.GPT_4oLiteral]: {
      model: Models.GPT_4o,
      modelOptions: Models.GPT_4oOptions,
      modelSchema: Models.GPT_4oSchema,
    },
    [Models.GPT_4o_Mini_2024_07_18Literal]: {
      model: Models.GPT_4o_Mini_2024_07_18,
      modelOptions: Models.GPT_4o_Mini_2024_07_18Options,
      modelSchema: Models.GPT_4o_Mini_2024_07_18Schema,
    },
    [Models.GPT_4o_2024_05_13Literal]: {
      model: Models.GPT_4o_2024_05_13,
      modelOptions: Models.GPT_4o_2024_05_13Options,
      modelSchema: Models.GPT_4o_2024_05_13Schema,
    },
    [Models.O1_MiniLiteral]: {
      model: Models.O1_Mini,
      modelOptions: Models.O1_MiniOptions,
      modelSchema: Models.O1_MiniSchema,
    },
    [Models.O1_PreviewLiteral]: {
      model: Models.O1_Preview,
      modelOptions: Models.O1_PreviewOptions,
      modelSchema: Models.O1_PreviewSchema,
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
    [Models.Text_Embedding_Ada002Literal]: {
      model: Models.Text_Embedding_Ada002,
      modelOptions: Models.Text_Embedding_Ada002_Options,
      modelSchema: Models.Text_Embedding_Ada002Schema,
    },
    [Models.Text_Embedding_3_SmallLiteral]: {
      model: Models.Text_Embedding_3_Small,
      modelOptions: Models.Text_Embedding_3_Small_Options,
      modelSchema: Models.Text_Embedding_3_SmallSchema,
    },
    [Models.Text_Embedding_3_LargeLiteral]: {
      model: Models.Text_Embedding_3_Large,
      modelOptions: Models.Text_Embedding_3_Large_Options,
      modelSchema: Models.Text_Embedding_3_LargeSchema,
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
        info: `OpenAI chat model: ${modelName} not found`,
        cause: new Error(`OpenAI chat model: ${modelName} not found, available chat models: 
          [${this.chatModelLiterals().join(", ")}]`),
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
        info: `OpenAI embedding model: ${modelName} not found`,
        cause: new Error(`OpenAI embedding model: ${modelName} not found, available embedding models: 
          [${this.embeddingModelLiterals().join(", ")}]`),
      });
    }

    const model = this.embeddingModelFactories[modelName].model;
    const parsedOptions = this.embeddingModelFactories[modelName].modelOptions.parse(options);
    return new model(parsedOptions);
  }
}

export { OpenAI, ProviderLiteral };

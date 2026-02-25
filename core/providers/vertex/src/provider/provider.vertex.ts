import { z } from "zod";

import { ChatModelSchemaType, ChatModelV1, EmbeddingModelSchemaType, EmbeddingModelV1, ProviderError, ProviderV1 } from "@adaline/provider";

import * as Models from "../models";

const ProviderLiteral = "vertex";
class Vertex<C extends Models.BaseChatModelOptionsType, E extends Models.BaseEmbeddingModelOptionsType> implements ProviderV1<C, E> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;

  static readonly baseUrl = (location: string, projectId: string, publisher: string = "google") =>
    `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/${publisher}`;

  private readonly chatModelFactories: Record<
    string,
    {
      model: { new (options: any): ChatModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: ChatModelSchemaType;
    }
  > = {
    [Models.Gemini1_5Flash001Literal]: {
      model: Models.Gemini1_5Flash001,
      modelOptions: Models.Gemini1_5Flash001Options,
      modelSchema: Models.Gemini1_5Flash001Schema,
    },
    [Models.Gemini1_5Flash002Literal]: {
      model: Models.Gemini1_5Flash002,
      modelOptions: Models.Gemini1_5Flash002Options,
      modelSchema: Models.Gemini1_5Flash002Schema,
    },
    [Models.Gemini1_5FlashLatestLiteral]: {
      model: Models.Gemini1_5FlashLatest,
      modelOptions: Models.Gemini1_5FlashLatestOptions,
      modelSchema: Models.Gemini1_5FlashLatestSchema,
    },
    [Models.Gemini1_5FlashLiteral]: {
      model: Models.Gemini1_5Flash,
      modelOptions: Models.Gemini1_5FlashOptions,
      modelSchema: Models.Gemini1_5FlashSchema,
    },
    [Models.Gemini1_5Pro001Literal]: {
      model: Models.Gemini1_5Pro001,
      modelOptions: Models.Gemini1_5Pro001Options,
      modelSchema: Models.Gemini1_5Pro001Schema,
    },
    [Models.Gemini1_5Pro002Literal]: {
      model: Models.Gemini1_5Pro002,
      modelOptions: Models.Gemini1_5Pro002Options,
      modelSchema: Models.Gemini1_5Pro002Schema,
    },
    [Models.Gemini1_5ProLatestLiteral]: {
      model: Models.Gemini1_5ProLatest,
      modelOptions: Models.Gemini1_5ProLatestOptions,
      modelSchema: Models.Gemini1_5ProLatestSchema,
    },
    [Models.Gemini1_5ProLiteral]: {
      model: Models.Gemini1_5Pro,
      modelOptions: Models.Gemini1_5ProOptions,
      modelSchema: Models.Gemini1_5ProSchema,
    },
    [Models.Gemini2_0FlashExpLiteral]: {
      model: Models.Gemini2_0FlashExp,
      modelOptions: Models.Gemini2_0FlashExpOptions,
      modelSchema: Models.Gemini2_0FlashExpSchema,
    },
    [Models.Gemini2_0FlashLiteral]: {
      model: Models.Gemini2_0Flash,
      modelOptions: Models.Gemini2_0FlashOptions,
      modelSchema: Models.Gemini2_0FlashSchema,
    },
    [Models.Gemini2_0FlashLiteLiteral]: {
      model: Models.Gemini2_0FlashLite,
      modelOptions: Models.Gemini2_0FlashLiteOptions,
      modelSchema: Models.Gemini2_0FlashLiteSchema,
    },
    [Models.Gemini2_5FlashLiteLiteral]: {
      model: Models.Gemini2_5FlashLite,
      modelOptions: Models.Gemini2_5FlashLiteOptions,
      modelSchema: Models.Gemini2_5FlashLiteSchema,
    },
    [Models.Gemini2_5FlashLitePreview092025Literal]: {
      model: Models.Gemini2_5FlashLitePreview092025,
      modelOptions: Models.Gemini2_5FlashLitePreview092025Options,
      modelSchema: Models.Gemini2_5FlashLitePreview092025Schema,
    },
    [Models.Gemini2_5FlashPreview0417Literal]: {
      model: Models.Gemini2_5FlashPreview0417,
      modelOptions: Models.Gemini2_5FlashPreview0417Options,
      modelSchema: Models.Gemini2_5FlashPreview0417Schema,
    },
    [Models.Gemini2_5ProPreview0325Literal]: {
      model: Models.Gemini2_5ProPreview0325,
      modelOptions: Models.Gemini2_5ProPreview0325Options,
      modelSchema: Models.Gemini2_5ProPreview0325Schema,
    },
    [Models.Gemini2_5FlashLiteral]: {
      model: Models.Gemini2_5Flash,
      modelOptions: Models.Gemini2_5FlashOptions,
      modelSchema: Models.Gemini2_5FlashSchema,
    },
    [Models.Gemini2_5ProLiteral]: {
      model: Models.Gemini2_5Pro,
      modelOptions: Models.Gemini2_5ProOptions,
      modelSchema: Models.Gemini2_5ProSchema,
    },
    [Models.Gemini3FlashPreviewLiteral]: {
      model: Models.Gemini3FlashPreview,
      modelOptions: Models.Gemini3FlashPreviewOptions,
      modelSchema: Models.Gemini3FlashPreviewSchema,
    },
    [Models.Gemini3_1ProPreviewLiteral]: {
      model: Models.Gemini3_1ProPreview,
      modelOptions: Models.Gemini3_1ProPreviewOptions,
      modelSchema: Models.Gemini3_1ProPreviewSchema,
    },
    [Models.Gemini3ProPreviewLiteral]: {
      model: Models.Gemini3ProPreview,
      modelOptions: Models.Gemini3ProPreviewOptions,
      modelSchema: Models.Gemini3ProPreviewSchema,
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
    [Models.Text_Embedding_004Literal]: {
      model: Models.Text_Embedding_004,
      modelOptions: Models.Text_Embedding_004Options,
      modelSchema: Models.Text_Embedding_004Schema,
    },
    [Models.Text_Multilingual_Embedding_002Literal]: {
      model: Models.Text_Multilingual_Embedding_002,
      modelOptions: Models.Text_Multilingual_Embedding_002Options,
      modelSchema: Models.Text_Multilingual_Embedding_002Schema,
    },
    [Models.Text_Embedding_Gecko_003Literal]: {
      model: Models.Text_Embedding_Gecko_003,
      modelOptions: Models.Text_Embedding_Gecko_003Options,
      modelSchema: Models.Text_Embedding_Gecko_003Schema,
    },
    [Models.Text_Embedding_Gecko_Multilingual_001Literal]: {
      model: Models.Text_Embedding_Gecko_Multilingual_001,
      modelOptions: Models.Text_Embedding_Gecko_Multilingual_001Options,
      modelSchema: Models.Text_Embedding_Gecko_Multilingual_001Schema,
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
        info: `Vertex chat model: ${modelName} not found`,
        cause: new Error(`Vertex chat model: ${modelName} not found, available chat models: 
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
        info: `Vertex embedding model: ${modelName} not found`,
        cause: new Error(`Vertex embedding model: ${modelName} not found, available embedding models: 
          ${this.embeddingModelLiterals().join(", ")}`),
      });
    }

    const model = this.embeddingModelFactories[modelName].model;
    const parsedOptions = this.embeddingModelFactories[modelName].modelOptions.parse(options);
    return new model(parsedOptions);
  }
}

export { Vertex };

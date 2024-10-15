import { z } from "zod";

import { ChatModelSchemaType, ChatModelV1, EmbeddingModelSchemaType, EmbeddingModelV1, ProviderError, ProviderV1 } from "@adaline/provider";

import * as Models from "../models";

const ProviderLiteral = "groq";
class Groq<C extends Models.BaseChatModelOptionsType, E extends Record<string, any> = Record<string, any>> implements ProviderV1<C, E> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;
  static readonly baseUrl = "https://api.groq.com/openai/v1";

  private readonly chatModelFactories: Record<
    string,
    {
      model: { new (options: any): ChatModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: ChatModelSchemaType;
    }
  > = {
    [Models.Gemma_7b_ITLiteral]: {
      model: Models.Gemma_7b_IT,
      modelOptions: Models.Gemma_7b_ITOptions,
      modelSchema: Models.Gemma_7b_ITSchema,
    },
    [Models.Gemma2_9b_ITLiteral]: {
      model: Models.Gemma2_9b_IT,
      modelOptions: Models.Gemma2_9b_ITOptions,
      modelSchema: Models.Gemma2_9b_ITSchema,
    },
    [Models.LlamaGuard_3_8bLiteral]: {
      model: Models.LlamaGuard_3_8b,
      modelOptions: Models.LlamaGuard_3_8bOptions,
      modelSchema: Models.LlamaGuard_3_8bSchema,
    },
    [Models.Llama_3_8bLiteral]: {
      model: Models.Llama_3_8b,
      modelOptions: Models.Llama_3_8bOptions,
      modelSchema: Models.Llama_3_8bSchema,
    },
    [Models.Llama_3_70bLiteral]: {
      model: Models.Llama_3_70b,
      modelOptions: Models.Llama_3_70bOptions,
      modelSchema: Models.Llama_3_70bSchema,
    },
    [Models.Llama_3_1_8bLiteral]: {
      model: Models.Llama_3_1_8b,
      modelOptions: Models.Llama_3_1_8b_Options,
      modelSchema: Models.Llama_3_1_8bSchema,
    },
    [Models.Llama_3_8b_Tool_UseLiteral]: {
      model: Models.Llama_3_8b_Tool_Use,
      modelOptions: Models.Llama_3_8b_Tool_Use_Options,
      modelSchema: Models.Llama_3_8b_Tool_UseSchema,
    },
    [Models.Llama_3_1_70bLiteral]: {
      model: Models.Llama_3_1_70b,
      modelOptions: Models.Llama_3_1_70b_Options,
      modelSchema: Models.Llama_3_1_70bSchema,
    },
    [Models.Llama_3_70b_Tool_UseLiteral]: {
      model: Models.Llama_3_70b_Tool_Use,
      modelOptions: Models.Llama_3_70b_Tool_Use_Options,
      modelSchema: Models.Llama_3_70b_Tool_UseSchema,
    },
    [Models.Llama_3_2_11b_VisionLiteral]: {
      model: Models.Llama_3_2_11b_Vision,
      modelOptions: Models.Llama_3_2_11b_VisionOptions,
      modelSchema: Models.Llama_3_2_11b_VisionSchema,
    },
    [Models.Llama_3_2_3bLiteral]: {
      model: Models.Llama_3_2_3b,
      modelOptions: Models.Llama_3_2_3b_Options,
      modelSchema: Models.Llama_3_2_3bSchema,
    },
    [Models.Llama_3_2_1bLiteral]: {
      model: Models.Llama_3_2_1b,
      modelOptions: Models.Llama_3_2_1b_Options,
      modelSchema: Models.Llama_3_2_1bSchema,
    },
    [Models.Mixtral_8x7bLiteral]: {
      model: Models.Mixtral_8x7b,
      modelOptions: Models.Mixtral_8x7bOptions,
      modelSchema: Models.Mixtral_8x7bSchema,
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
        info: `Groq chat model: ${modelName} not found`,
        cause: new Error(`Groq chat model: ${modelName} not found, available chat models: 
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
      info: "Groq does not support embedding models yet",
      cause: new Error("Groq does not support embedding models yet"),
    });
  }
}

export { Groq };

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
    [Models.Gemma2_9b_ITLiteral]: {
      model: Models.Gemma2_9b_IT,
      modelOptions: Models.Gemma2_9b_ITOptions,
      modelSchema: Models.Gemma2_9b_ITSchema,
    },
    [Models.Llama_3_1_8bLiteral]: {
      model: Models.Llama_3_1_8b,
      modelOptions: Models.Llama_3_1_8b_Options,
      modelSchema: Models.Llama_3_1_8bSchema,
    },
    [Models.Llama_3_3_70b_VersatileLiteral]: {
      model: Models.Llama_3_3_70b_Versatile,
      modelOptions: Models.Llama_3_3_70b_Versatile_Options,
      modelSchema: Models.Llama_3_3_70b_VersatileSchema,
    },
    [Models.Llama_Guard_4_12bLiteral]: {
      model: Models.Llama_Guard_4_12b,
      modelOptions: Models.Llama_Guard_4_12b_Options,
      modelSchema: Models.Llama_Guard_4_12bSchema,
    },
    [Models.Qwen3_32bLiteral]: {
      model: Models.Qwen3_32b,
      modelOptions: Models.Qwen3_32b_Options,
      modelSchema: Models.Qwen3_32bSchema,
    },
    [Models.Deepseek_R1_Distill_Llama_70bLiteral]: {
      model: Models.Deepseek_R1_Distill_Llama_70b,
      modelOptions: Models.Deepseek_R1_Distill_Llama_70b_Options,
      modelSchema: Models.Deepseek_R1_Distill_Llama_70bSchema,
    },
    [Models.Kimi_K2_InstructLiteral]: {
      model: Models.Kimi_K2_Instruct,
      modelOptions: Models.Kimi_K2_Instruct_Options,
      modelSchema: Models.Kimi_K2_InstructSchema,
    },
    [Models.Llama_4_Maverick_17b_128e_InstructLiteral]: {
      model: Models.Llama_4_Maverick_17b_128e_Instruct,
      modelOptions: Models.Llama_4_Maverick_17b_128e_Instruct_Options,
      modelSchema: Models.Llama_4_Maverick_17b_128e_InstructSchema,
    },
    [Models.Llama_4_Scout_17b_16e_InstructLiteral]: {
      model: Models.Llama_4_Scout_17b_16e_Instruct,
      modelOptions: Models.Llama_4_Scout_17b_16e_Instruct_Options,
      modelSchema: Models.Llama_4_Scout_17b_16e_InstructSchema,
    },
    [Models.Gpt_Oss_20bLiteral]: {
      model: Models.Gpt_Oss_20b,
      modelOptions: Models.Gpt_Oss_20b_Options,
      modelSchema: Models.Gpt_Oss_20bSchema,
    },
    [Models.Gpt_Oss_120bLiteral]: {
      model: Models.Gpt_Oss_120b,
      modelOptions: Models.Gpt_Oss_120b_Options,
      modelSchema: Models.Gpt_Oss_120bSchema,
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

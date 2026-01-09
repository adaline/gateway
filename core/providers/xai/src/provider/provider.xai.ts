import { z } from "zod";

import { ChatModelSchemaType, ChatModelV1, ProviderError, ProviderV1 } from "@adaline/provider";

import * as Models from "../models";

const ProviderLiteral = "xai";

class XAI<C extends Models.BaseChatModelOptionsType> implements ProviderV1<C, never> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;
  static readonly baseUrl = "https://api.x.ai/v1";

  private readonly chatModelFactories: Record<
    string,
    {
      model: { new (options: any): ChatModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: ChatModelSchemaType;
    }
  > = {
    [Models.Grok_2_Literal]: {
      model: Models.Grok_2,
      modelOptions: Models.Grok_2_Options,
      modelSchema: Models.Grok_2_Schema,
    },
    [Models.Grok_2_Latest_Literal]: {
      model: Models.Grok_2_Latest,
      modelOptions: Models.Grok_2_Latest_Options,
      modelSchema: Models.Grok_2_Latest_Schema,
    },
    [Models.Grok_2_1212_Literal]: {
      model: Models.Grok_2_1212,
      modelOptions: Models.Grok_2_1212_Options,
      modelSchema: Models.Grok_2_1212_Schema,
    },
    [Models.Grok_3_Beta_Literal]: {
      model: Models.Grok_3_Beta,
      modelOptions: Models.Grok_3_Beta_Options,
      modelSchema: Models.Grok_3_Beta_Schema,
    },
    [Models.Grok_3_Fast_Beta_Literal]: {
      model: Models.Grok_3_Fast_Beta,
      modelOptions: Models.Grok_3_Fast_Beta_Options,
      modelSchema: Models.Grok_3_Fast_Beta_Schema,
    },
    [Models.Grok_3_Mini_Beta_Literal]: {
      model: Models.Grok_3_Mini_Beta,
      modelOptions: Models.Grok_3_Mini_Beta_Options,
      modelSchema: Models.Grok_3_Mini_Beta_Schema,
    },
    [Models.Grok_3_Mini_Fast_Beta_Literal]: {
      model: Models.Grok_3_Mini_Fast_Beta,
      modelOptions: Models.Grok_3_Mini_Fast_Beta_Options,
      modelSchema: Models.Grok_3_Mini_Fast_Beta_Schema,
    },
    [Models.Grok_4_Literal]: {
      model: Models.Grok_4,
      modelOptions: Models.Grok_4_Options,
      modelSchema: Models.Grok_4_Schema,
    },
    [Models.Grok_4_0709_Literal]: {
      model: Models.Grok_4_0709,
      modelOptions: Models.Grok_4_0709_Options,
      modelSchema: Models.Grok_4_0709_Schema,
    },
    [Models.Grok_4_Fast_Reasoning_Literal]: {
      model: Models.Grok_4_Fast_Reasoning,
      modelOptions: Models.Grok_4_Fast_Reasoning_Options,
      modelSchema: Models.Grok_4_Fast_Reasoning_Schema,
    },
    [Models.Grok_4_Fast_Non_Reasoning_Literal]: {
      model: Models.Grok_4_Fast_Non_Reasoning,
      modelOptions: Models.Grok_4_Fast_Non_Reasoning_Options,
      modelSchema: Models.Grok_4_Fast_Non_Reasoning_Schema,
    },
    [Models.Grok_4_1_Fast_Reasoning_Literal]: {
      model: Models.Grok_4_1_Fast_Reasoning,
      modelOptions: Models.Grok_4_1_Fast_Reasoning_Options,
      modelSchema: Models.Grok_4_1_Fast_Reasoning_Schema,
    },
    [Models.Grok_4_1_Fast_Non_Reasoning_Literal]: {
      model: Models.Grok_4_1_Fast_Non_Reasoning,
      modelOptions: Models.Grok_4_1_Fast_Non_Reasoning_Options,
      modelSchema: Models.Grok_4_1_Fast_Non_Reasoning_Schema,
    },
    [Models.Grok_Code_Fast_1_Literal]: {
      model: Models.Grok_Code_Fast_1,
      modelOptions: Models.Grok_Code_Fast_1_Options,
      modelSchema: Models.Grok_Code_Fast_1_Schema,
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
    const factory = this.chatModelFactories[modelName];
    if (!factory) {
      throw new ProviderError({
        info: `Invalid model name: '${modelName}' for provider: '${this.name}'`,
        cause: new Error(`Available models: [${this.chatModelLiterals().join(", ")}]`),
      });
    }
    const parsedOptions = factory.modelOptions.parse(options);
    return new factory.model(parsedOptions);
  }

  // XAI does not support embedding models
  embeddingModelLiterals(): string[] {
    return [];
  }

  embeddingModelSchemas(): Record<string, never> {
    return {};
  }

  embeddingModel(): never {
    throw new ProviderError({
      info: "XAI does not support embedding models",
      cause: new Error("No embedding models available"),
    });
  }
}

export { ProviderLiteral, XAI };

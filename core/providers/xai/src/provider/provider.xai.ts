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
    [Models.Grok_4_5_Literal]: {
      model: Models.Grok_4_5,
      modelOptions: Models.Grok_4_5_Options,
      modelSchema: Models.Grok_4_5_Schema,
    },
    [Models.Grok_4_3_Literal]: {
      model: Models.Grok_4_3,
      modelOptions: Models.Grok_4_3_Options,
      modelSchema: Models.Grok_4_3_Schema,
    },
    [Models.Grok_4_20_0309_Reasoning_Literal]: {
      model: Models.Grok_4_20_0309_Reasoning,
      modelOptions: Models.Grok_4_20_0309_Reasoning_Options,
      modelSchema: Models.Grok_4_20_0309_Reasoning_Schema,
    },
    [Models.Grok_4_20_0309_Non_Reasoning_Literal]: {
      model: Models.Grok_4_20_0309_Non_Reasoning,
      modelOptions: Models.Grok_4_20_0309_Non_Reasoning_Options,
      modelSchema: Models.Grok_4_20_0309_Non_Reasoning_Schema,
    },
    [Models.Grok_4_20_Multi_Agent_0309_Literal]: {
      model: Models.Grok_4_20_Multi_Agent_0309,
      modelOptions: Models.Grok_4_20_Multi_Agent_0309_Options,
      modelSchema: Models.Grok_4_20_Multi_Agent_0309_Schema,
    },
    [Models.Grok_Build_0_1_Literal]: {
      model: Models.Grok_Build_0_1,
      modelOptions: Models.Grok_Build_0_1_Options,
      modelSchema: Models.Grok_Build_0_1_Schema,
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

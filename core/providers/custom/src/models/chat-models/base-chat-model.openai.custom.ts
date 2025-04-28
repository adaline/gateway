import { BaseChatModel } from "@adaline/openai";
import { ChatModelSchemaType, ModelResponseError } from "@adaline/provider";
import { ChatModelPriceType } from "@adaline/types";

import { BaseChatModelOptions, BaseChatModelOptionsType } from "./chat-model-options.custom";

class BaseChatModelOpenAI extends BaseChatModel {
  readonly version = "v1" as const;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);

    super(modelSchema, {
      modelName: parsedOptions.modelName,
      apiKey: parsedOptions.apiKey,
      baseUrl: parsedOptions.baseUrl,
      completeChatUrl: parsedOptions.completeChatUrl,
      streamChatUrl: parsedOptions.streamChatUrl,
    });
  }
  getModelPricing(): ChatModelPriceType {
    throw new ModelResponseError({
      info: `Invalid model pricing for model : '${this.modelName}'`,
      cause: new Error(`No pricing configuration for custom provider`),
    });
  }
}

export { BaseChatModelOpenAI };

import { BaseChatModel } from "@adaline/openai";
import { ChatModelSchemaType } from "@adaline/provider";

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
}

export { BaseChatModelOpenAI };

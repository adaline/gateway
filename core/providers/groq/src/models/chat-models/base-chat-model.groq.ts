import { z } from "zod";

import { BaseChatModel, OpenAIChatRequestMessageType } from "@adaline/openai";
import { ChatModelSchemaType, InvalidMessagesError, ModelResponseError, ParamsType } from "@adaline/provider";
import { ChatModelPriceType, MessageType } from "@adaline/types";

import { Groq } from "../../provider";
import pricingData from "./../pricing.json";

const BaseChatModelOptions = z.object({
  modelName: z.string().min(1),
  apiKey: z.string().min(1),
});
type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

class BaseChatModelGroq extends BaseChatModel {
  readonly version = "v1" as const;
  modelSchema: ChatModelSchemaType;
  readonly modelName: string;

  private readonly groqApiKey: string;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    const baseUrl = Groq.baseUrl;
    super(modelSchema, {
      modelName: parsedOptions.modelName,
      apiKey: parsedOptions.apiKey,
      baseUrl: baseUrl,
      completeChatUrl: `${baseUrl}/chat/completions`,
      streamChatUrl: `${baseUrl}/chat/completions`,
    });
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.groqApiKey = parsedOptions.apiKey;
  }

  transformMessages(messages: MessageType[]): ParamsType {
    const hasSystemRole = messages.some((msg) => msg.role === "system");
    const hasImageModality = messages.some((msg) => msg.content.some((content: any) => content.modality === "image"));

    if (hasSystemRole && hasImageModality) {
      throw new InvalidMessagesError({
        info: `Invalid message content for model : '${this.modelName}'`,
        cause: new Error("Prompting with images is incompatible with system messages`)"),
      });
    }

    const transformedMessages = super.transformMessages(messages) as { messages: OpenAIChatRequestMessageType[] };

    // Groq expects the content to be a string for system and assistant messages
    // OpenAI transformer takes care of validating role and modality
    transformedMessages.messages.forEach((message) => {
      if (message.role === "system") {
        if (typeof message.content !== "string") {
          message.content = message.content.map((content) => content.text).join("\n");
        }
      } else if (message.role === "assistant") {
        if (message.content && typeof message.content !== "string") {
          message.content = message.content.map((content) => content.text).join("\n");
        }
      }
    });

    return transformedMessages;
  }
  getModelPricing(): ChatModelPriceType {
    const entry = pricingData.find((m) => m.modelName === this.modelName);
    if (!entry) {
      throw new ModelResponseError({
        info: `Invalid model pricing for model : '${this.modelName}'`,
        cause: new Error(`No pricing configuration found for model "${this.modelName}"`),
      });
    }
    return entry as ChatModelPriceType;
  }
}

export { BaseChatModelGroq, BaseChatModelOptions, type BaseChatModelOptionsType };

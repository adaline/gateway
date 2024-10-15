import { z } from "zod";

import { BaseChatModel, OpenAIChatRequestMessageType } from "@adaline/openai";
import { ChatModelSchemaType, ParamsType } from "@adaline/provider";
import { MessageType } from "@adaline/types";

import { Groq } from "../../provider";

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

  // TODO: streamChat needs it's own implementation, OpenAI stream transformer is skipping some chunks
}

export { BaseChatModelGroq, BaseChatModelOptions, type BaseChatModelOptionsType };

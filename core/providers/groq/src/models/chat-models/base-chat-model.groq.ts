import { z } from "zod";

import { BaseChatModel, OpenAIChatRequestMessageType, OpenAIStreamChatResponse } from "@adaline/openai";
import { ChatModelSchemaType, ModelResponseError, ParamsType } from "@adaline/provider";
import {
  AssistantRoleLiteral,
  createPartialTextMessage,
  createPartialToolCallMessage,
  MessageType,
  PartialChatResponseType,
} from "@adaline/types";

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

  async *transformStreamChatResponseChunk(
    chunk: string,
    buffer: string
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    const data = buffer + chunk;
    let lines: string[] = [];
    let newBuffer = "";

    // Split data into complete lines and new buffer
    let currentIndex = 0;
    while (currentIndex < data.length) {
      const newlineIndex = data.indexOf("\n", currentIndex);
      if (newlineIndex === -1) {
        newBuffer = data.substring(currentIndex);
        break;
      } else {
        const line = data.substring(currentIndex, newlineIndex).trim();
        if (line) {
          lines.push(line);
        }
        currentIndex = newlineIndex + 1;
      }
    }

    // Process each complete line
    for (const line of lines) {
      if (line === "data: [DONE]") {
        return; // End of stream
      }

      let partialResponse: PartialChatResponseType = { partialMessages: [] };
      if (line.startsWith("data: ")) {
        const jsonStr = line.substring("data: ".length);
        try {
          const structuredLine = JSON.parse(jsonStr);
          const safe = OpenAIStreamChatResponse.safeParse(structuredLine);
          if (safe.success) {
            const parsedResponse = safe.data;
            // Process message content
            if (parsedResponse.choices.length > 0) {
              const message = parsedResponse.choices[0].delta;
              if (message !== undefined && Object.keys(message).length !== 0) {
                if ("content" in message && message.content !== null) {
                  partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, message.content as string));
                } else if ("refusal" in message && message.refusal !== null) {
                  partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, message.refusal as string));
                } else if ("tool_calls" in message && message.tool_calls !== undefined) {
                  const toolCall = message.tool_calls[0];
                  partialResponse.partialMessages.push(
                    createPartialToolCallMessage(
                      AssistantRoleLiteral,
                      toolCall.index,
                      toolCall.id,
                      toolCall.function?.name,
                      toolCall.function?.arguments
                    )
                  );
                }
              }
            }

            if (parsedResponse.usage) {
              partialResponse.usage = {
                promptTokens: parsedResponse.usage.prompt_tokens,
                completionTokens: parsedResponse.usage.completion_tokens,
                totalTokens: parsedResponse.usage.total_tokens,
              };
            }
            yield { partialResponse: partialResponse, buffer: newBuffer };
          } else {
            throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
          }
        } catch (error) {
          throw new ModelResponseError({
            info: `Malformed JSON received in stream: ${jsonStr}`,
            cause: error,
          });
        }
      }
    }

    // Yield the updated buffer after processing all lines
    yield { partialResponse: { partialMessages: [] }, buffer: newBuffer };
  }
}
export { BaseChatModelGroq, BaseChatModelOptions, type BaseChatModelOptionsType };

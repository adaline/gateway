import { z } from "zod";

import {
  ChatModelSchemaType,
  HeadersType,
  InvalidMessagesError,
  ModelResponseError,
  ParamsType,
  urlWithoutTrailingSlash,
} from "@adaline/provider";
import {
  AssistantRoleLiteral,
  ChatResponseType,
  ConfigType,
  createPartialTextMessage,
  createPartialToolCallMessage,
  createTextContent,
  createToolCallContent,
  Message,
  MessageType,
  PartialChatResponseType,
  SystemRoleLiteral,
  TextModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ToolResponseContentType,
  ToolRoleLiteral,
  ToolType,
  UserRoleLiteral,
  ImageModalityLiteral,
  Base64ImageContentValueType,
} from "@adaline/types";

import { OpenAI } from "./../../provider/provider.openai";
import { BaseChatModel } from "./base-chat-model.openai";

/**
 * Base Chat Model Options for Responses API
 *
 * Note: Uses same base options as BaseChatModel - no additional parameters needed.
 * The Responses API specific behavior is handled via method overrides.
 */
const BaseChatModelResponsesApiOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().url().optional(),
  organization: z.string().optional(),
});
type BaseChatModelResponsesApiOptionsType = z.infer<typeof BaseChatModelResponsesApiOptions>;


class BaseChatModelResponsesApi extends BaseChatModel {
  private readonly responsesUrl: string;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelResponsesApiOptionsType) {
    const parsedOptions = BaseChatModelResponsesApiOptions.parse(options);
    const baseUrl = urlWithoutTrailingSlash(parsedOptions.baseUrl || OpenAI.baseUrl);
    const responsesUrl = `${baseUrl}/responses`;

    // Pass to parent with responses endpoint URLs
    super(modelSchema, {
      modelName: parsedOptions.modelName,
      apiKey: parsedOptions.apiKey,
      baseUrl: parsedOptions.baseUrl,
      organization: parsedOptions.organization,
      completeChatUrl: responsesUrl,
      streamChatUrl: responsesUrl,
    });

    this.responsesUrl = responsesUrl;
  }

  /**
   * Override getStreamChatHeaders to add Accept: text/event-stream for Responses API
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStreamChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    return Promise.resolve({
      ...this.getDefaultHeaders(),
      Accept: "text/event-stream",
    });
  }

  /**
   * Override getProxyStreamChatHeaders to add Accept header for Responses API
   */
  async getProxyStreamChatHeaders(
    data?: any,
    headers?: Record<string, string>,
    query?: Record<string, string>
  ): Promise<HeadersType> {
    const baseHeaders = await this.getProxyCompleteChatHeaders(data, headers, query);
    return {
      ...baseHeaders,
      Accept: "text/event-stream",
    };
  }

  /**
   * Override transformConfig to handle Responses API specific config format
   */
  transformConfig(config: ConfigType, messages?: MessageType[], tools?: ToolType[]): ParamsType {
    const baseConfig = super.transformConfig(config, messages, tools);
    const transformedConfig = { ...baseConfig };

    // Transform reasoning_effort to nested object
    if ("reasoning_effort" in transformedConfig && transformedConfig.reasoning_effort !== undefined) {
      transformedConfig.reasoning = {
        effort: transformedConfig.reasoning_effort,
      };
      delete transformedConfig.reasoning_effort;
    }

    // Transform verbosity to nested object
    if ("verbosity" in transformedConfig && transformedConfig.verbosity !== undefined) {
      transformedConfig.text = {
        verbosity: transformedConfig.verbosity,
      };
      delete transformedConfig.verbosity;
    }

    return transformedConfig;
  }

  /**
   * Override transformMessages to use Responses API content types
   */
  transformMessages(messages: MessageType[]): ParamsType {
    if (!messages || messages.length === 0) {
      return { messages: [] };
    }

    const parsedMessages = messages.map((message) => {
      const parsedMessage = Message().safeParse(message);
      if (!parsedMessage.success) {
        throw new InvalidMessagesError({ info: "Invalid messages", cause: parsedMessage.error });
      }
      return parsedMessage.data;
    });

    parsedMessages.forEach((message) => {
      message.content.forEach((content) => {
        if (!this.modelSchema.modalities.includes(content.modality)) {
          throw new InvalidMessagesError({
            info: `Invalid message content for model : '${this.modelName}'`,
            cause: new Error(`model : '${this.modelName}' does not support modality : '${content.modality}', 
              available modalities : [${this.modelSchema.modalities.join(", ")}]`),
          });
        }
      });
    });

    parsedMessages.forEach((message) => {
      if (!Object.keys(this.modelSchema.roles).includes(message.role)) {
        throw new InvalidMessagesError({
          info: `Invalid message content for model : '${this.modelName}'`,
          cause: new Error(`model : '${this.modelName}' does not support role : '${message.role}', 
            available roles : [${Object.keys(this.modelSchema.roles).join(", ")}]`),
        });
      }
    });

    const transformedMessages = parsedMessages.map((message) => {
      switch (message.role) {
        case SystemRoleLiteral: {
          // Responses API uses "input_text" for system messages
          const textContent: { type: "input_text"; text: string }[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              textContent.push({ type: "input_text", text: content.value });
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          });

          return {
            role: this.modelSchema.roles[message.role],
            content: textContent,
          };
        }

        case AssistantRoleLiteral: {
          // Responses API uses "output_text" for assistant messages
          const textContent: { type: "output_text"; text: string }[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              textContent.push({ type: "output_text", text: content.value });
            } else if (content.modality === ToolCallModalityLiteral) {
              // Tool calls in message history are not supported for Responses API
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error("tool calls in message history are not supported for Responses API"),
              });
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          });

          return {
            role: this.modelSchema.roles[message.role],
            content: textContent,
          };
        }

        case UserRoleLiteral: {
          // Responses API uses "input_text" for user messages
          const userContent: (
            | { type: "input_text"; text: string }
            | { type: "image_url"; image_url: { url: string; detail: string } }
          )[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              userContent.push({ type: "input_text", text: content.value });
            } else if (content.modality === ImageModalityLiteral) {
              // Extract URL based on content value type with proper type narrowing
              const imageValue = content.value;
              const imageUrl = imageValue.type === "url" 
                ? imageValue.url 
                : (imageValue as Base64ImageContentValueType).base64;
              userContent.push({
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: content.detail,
                },
              });
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          });

          return {
            role: this.modelSchema.roles[message.role],
            content: userContent,
          };
        }

        case ToolRoleLiteral: {
          if (message.content.length !== 1) {
            throw new InvalidMessagesError({
              info: `Invalid message for role : '${message.role}'`,
              cause: new Error(`role : '${message.role}' must have exactly one content item`),
            });
          }

          if (message.content[0].modality !== ToolResponseModalityLiteral) {
            throw new InvalidMessagesError({
              info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
              cause: new Error(`role : '${message.role}' must have content with modality : '${ToolResponseModalityLiteral}'`),
            });
          }

          const toolResponse = message.content[0] as ToolResponseContentType;
          return {
            role: this.modelSchema.roles[message.role],
            tool_call_id: toolResponse.id,
            content: toolResponse.data,
          };
        }

        default: {
          throw new InvalidMessagesError({
            info: `Invalid message 'role' for model : ${this.modelName}`,
            cause: new Error(`role : '${message.role}' is not supported, 
              available roles : [${Object.keys(this.modelSchema.roles).join(", ")}]`),
          });
        }
      }
    });

    return { messages: transformedMessages };
  }

  /**
   * Override getCompleteChatData to use Responses API format (input instead of messages)
   */
  async getCompleteChatData(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType> {
    const transformedConfig = this.transformConfig(config, messages, tools);
    const transformedMessages = this.transformMessages(messages);
    if (transformedMessages.messages && (transformedMessages.messages as MessageType[]).length === 0) {
      throw new InvalidMessagesError({
        info: "Messages are required",
        cause: new Error("Messages are required"),
      });
    }

    const transformedTools = tools ? this.transformTools(tools) : {};

    // Responses API uses "input" instead of "messages"
    return Promise.resolve({
      ...this.getDefaultParams(),
      ...transformedConfig,
      ...transformedTools,
      input: transformedMessages.messages,
    });
  }

  /**
   * Override getStreamChatData to use Responses API format
   */
  async getStreamChatData(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType> {
    const transformedConfig = this.transformConfig(config, messages, tools);
    const transformedMessages = this.transformMessages(messages);
    if (transformedMessages.messages && (transformedMessages.messages as MessageType[]).length === 0) {
      throw new InvalidMessagesError({
        info: "Messages are required",
        cause: new Error("Messages are required"),
      });
    }

    const transformedTools = tools ? this.transformTools(tools) : {};

    // Responses API uses "input" instead of "messages", and just "stream: true"
    return Promise.resolve({
      ...this.getDefaultParams(),
      ...transformedConfig,
      ...transformedTools,
      input: transformedMessages.messages,
      stream: true,
    });
  }

  /**
   * Override transformCompleteChatResponse to handle Responses API response format
   */
  transformCompleteChatResponse(response: any): ChatResponseType {
    const output = response?.output || response?.outputs;
    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new ModelResponseError({
        info: "Invalid response from model",
        cause: new Error(`No output in response : ${JSON.stringify(response)}`),
      });
    }

    const messages: MessageType[] = [
      {
        role: AssistantRoleLiteral,
        content: [],
      },
    ];

    // Process all output items
    for (const outputItem of output) {
      // Handle message type output
      if (outputItem?.type === "message" && Array.isArray(outputItem.content)) {
        outputItem.content.forEach((contentItem: any) => {
          if (contentItem?.type === "text" || contentItem?.type === "output_text") {
            if (contentItem.text) {
              messages[0].content.push(createTextContent(contentItem.text));
            }
          } else if (contentItem?.type === "tool_call" && contentItem.tool_call) {
            const toolCall = contentItem.tool_call;
            messages[0].content.push(
              createToolCallContent(
                toolCall.index ?? 0,
                toolCall.id ?? "",
                toolCall.function?.name ?? "",
                toolCall.function?.arguments ?? ""
              )
            );
          }
        });
      }
      // Handle direct text/output_text items
      else if ((outputItem?.type === "text" || outputItem?.type === "output_text") && outputItem?.text) {
        messages[0].content.push(createTextContent(outputItem.text));
      }
      // Handle tool_call items
      else if (outputItem?.type === "tool_call" && outputItem.tool_call) {
        const toolCall = outputItem.tool_call;
        messages[0].content.push(
          createToolCallContent(
            toolCall.index ?? 0,
            toolCall.id ?? "",
            toolCall.function?.name ?? "",
            toolCall.function?.arguments ?? ""
          )
        );
      }
    }

    // If no content was found, try to extract text from the first output item
    if (messages[0].content.length === 0) {
      const first = output[0];
      const contents = first?.content || [];
      const textParts: string[] = [];

      contents.forEach((item: any) => {
        if ((item?.type === "text" || item?.type === "output_text") && item?.text) {
          textParts.push(item.text);
        }
      });

      if (textParts.length > 0) {
        messages[0].content.push(createTextContent(textParts.join("\n")));
      } else {
        throw new ModelResponseError({
          info: "Invalid response from model",
          cause: new Error(`No text content found in response : ${JSON.stringify(response)}`),
        });
      }
    }

    // Extract usage from Responses API format
    const usage = response.usage || {};
    return {
      messages: messages,
      usage: {
        promptTokens: usage.input_tokens ?? usage.prompt_tokens ?? 0,
        completionTokens: usage.output_tokens ?? usage.completion_tokens ?? 0,
        totalTokens: usage.total_tokens ?? (usage.input_tokens || 0) + (usage.output_tokens || 0),
      },
    };
  }

  /**
   * Override transformStreamChatResponseChunk to handle Responses API streaming format
   */
  async *transformStreamChatResponseChunk(
    chunk: string,
    buffer: string
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    const data = buffer + chunk;
    const lines: string[] = [];
    let newBuffer = "";

    // Parse lines from the data
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

    for (const line of lines) {
      if (line === "data: [DONE]") {
        return;
      }

      if (line.startsWith("data: ")) {
        const jsonStr = line.substring("data: ".length);
        try {
          const structuredLine = JSON.parse(jsonStr);
          const partialResponse: PartialChatResponseType = { partialMessages: [] };

          let hasHandledDelta = false;

          // Handle delta events (streaming chunks) - Responses API sends delta as a STRING
          if (structuredLine.type === "response.output_text.delta" || structuredLine.type === "output_text.delta") {
            if (typeof structuredLine.delta === "string" && structuredLine.delta.length > 0) {
              partialResponse.partialMessages.push(
                createPartialTextMessage(AssistantRoleLiteral, structuredLine.delta)
              );
              hasHandledDelta = true;
            }
          }

          // Handle content part added events
          if (structuredLine.type === "response.content_part.added" && structuredLine.part) {
            const part = structuredLine.part;
            if (part.type === "output_text" && typeof part.text === "string" && part.text.length > 0) {
              partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, part.text));
              hasHandledDelta = true;
            }
          }

          // Note: response.output_text.done contains the FULL text which duplicates deltas
          // We intentionally don't yield it as content to avoid duplication

          // Handle legacy format support (fallback for different API versions)
          if (!hasHandledDelta && structuredLine.delta) {
            const delta = structuredLine.delta;

            if (typeof delta === "string" && delta.length > 0) {
              partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, delta));
              hasHandledDelta = true;
            } else if (delta && typeof delta === "object" && delta.text !== undefined && delta.text !== null) {
              partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, delta.text));
              hasHandledDelta = true;
            } else if (Array.isArray(delta.content)) {
              delta.content.forEach((contentItem: any) => {
                if (contentItem?.type === "output_text" && contentItem?.text) {
                  partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, contentItem.text));
                  hasHandledDelta = true;
                } else if (contentItem?.type === "tool_call" && contentItem?.tool_call) {
                  const toolCall = contentItem.tool_call;
                  partialResponse.partialMessages.push(
                    createPartialToolCallMessage(
                      AssistantRoleLiteral,
                      toolCall.index ?? 0,
                      toolCall.id ?? "",
                      toolCall.function?.name,
                      toolCall.function?.arguments
                    )
                  );
                  hasHandledDelta = true;
                }
              });
            }
          }

          // Handle tool call events
          if (
            structuredLine.type === "tool_call" ||
            structuredLine.type === "tool_call.delta" ||
            structuredLine.type === "response.tool_call.delta"
          ) {
            if (structuredLine.delta?.tool_call) {
              const toolCall = structuredLine.delta.tool_call;
              partialResponse.partialMessages.push(
                createPartialToolCallMessage(
                  AssistantRoleLiteral,
                  toolCall.index ?? 0,
                  toolCall.id ?? "",
                  toolCall.function?.name,
                  toolCall.function?.arguments
                )
              );
            }
          }

          // Handle final output events (completion, not streaming)
          if (!structuredLine.delta && (structuredLine.output || structuredLine.outputs)) {
            const outputs = structuredLine.output || structuredLine.outputs;
            if (Array.isArray(outputs)) {
              outputs.forEach((item: any) => {
                if (item?.type === "message" && Array.isArray(item.content)) {
                  item.content.forEach((c: any) => {
                    if ((c?.type === "text" || c?.type === "output_text") && c?.text) {
                      partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, c.text));
                    } else if (c?.type === "tool_call" && c?.tool_call) {
                      const toolCall = c.tool_call;
                      partialResponse.partialMessages.push(
                        createPartialToolCallMessage(
                          AssistantRoleLiteral,
                          toolCall.index ?? 0,
                          toolCall.id ?? "",
                          toolCall.function?.name,
                          toolCall.function?.arguments
                        )
                      );
                    }
                  });
                } else if ((item?.type === "text" || item?.type === "output_text") && item?.text) {
                  partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, item.text));
                } else if (item?.type === "tool_call" && item?.tool_call) {
                  const toolCall = item.tool_call;
                  partialResponse.partialMessages.push(
                    createPartialToolCallMessage(
                      AssistantRoleLiteral,
                      toolCall.index ?? 0,
                      toolCall.id ?? "",
                      toolCall.function?.name,
                      toolCall.function?.arguments
                    )
                  );
                }
              });
            }
          }

          // Handle usage information
          if (structuredLine.usage) {
            partialResponse.usage = {
              promptTokens:
                structuredLine.usage.input_tokens ??
                structuredLine.usage.prompt_tokens ??
                structuredLine.usage.promptTokens ??
                0,
              completionTokens:
                structuredLine.usage.output_tokens ??
                structuredLine.usage.completion_tokens ??
                structuredLine.usage.completionTokens ??
                0,
              totalTokens:
                structuredLine.usage.total_tokens ??
                structuredLine.usage.totalTokens ??
                (structuredLine.usage.input_tokens || 0) + (structuredLine.usage.output_tokens || 0),
            };
          }

          // Yield if we have content or usage
          if (partialResponse.partialMessages.length > 0 || partialResponse.usage) {
            yield { partialResponse, buffer: newBuffer };
          }
        } catch (error) {
          throw new ModelResponseError({
            info: `Malformed JSON received in stream: ${jsonStr}`,
            cause: error,
          });
        }
      }
    }

    // Don't yield empty responses for Responses API
    return;
  }
}

export {
  BaseChatModelResponsesApi,
  BaseChatModelResponsesApiOptions,
  type BaseChatModelResponsesApiOptionsType,
};

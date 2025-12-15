import { z } from "zod";

import {
  ChatModelSchemaType,
  ChatModelV1,
  HeadersType,
  InvalidConfigError,
  InvalidMessagesError,
  InvalidToolsError,
  ModelResponseError,
  ParamsType,
  UrlType,
  urlWithoutTrailingSlash,
} from "@adaline/provider";
import {
  AssistantRoleLiteral,
  Base64ImageContentValueType,
  ChatModelPriceType,
  ChatResponseType,
  Config,
  ConfigType,
  createPartialTextMessage,
  createPartialToolCallMessage,
  createTextContent,
  createToolCallContent,
  ImageModalityLiteral,
  Message,
  MessageType,
  PartialChatResponseType,
  SystemRoleLiteral,
  TextModalityLiteral,
  Tool,
  ToolCallModalityLiteral,
  ToolResponseContentType,
  ToolResponseModalityLiteral,
  ToolRoleLiteral,
  ToolType,
  UserRoleLiteral,
} from "@adaline/types";

import pricingData from "../pricing.json";
import { OpenAI } from "./../../provider/provider.openai";

const BaseChatModelResponsesApiOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().url().optional(),
  organization: z.string().optional(),
});
type BaseChatModelResponsesApiOptionsType = z.infer<typeof BaseChatModelResponsesApiOptions>;

/**
 * Standalone base class for OpenAI Responses API models.
 * Implements ChatModelV1 directly without extending BaseChatModel.
 * All logic is specific to the Responses API format used by GPT-5.2 Pro and similar models.
 */
class BaseChatModelResponsesApi implements ChatModelV1<ChatModelSchemaType> {
  readonly version = "v1" as const;
  modelSchema: ChatModelSchemaType;
  modelName: string;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly responsesUrl: string;
  private readonly organization: string | undefined;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelResponsesApiOptionsType) {
    const parsedOptions = BaseChatModelResponsesApiOptions.parse(options);
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.apiKey = parsedOptions.apiKey;
    this.baseUrl = urlWithoutTrailingSlash(parsedOptions.baseUrl || OpenAI.baseUrl);
    this.responsesUrl = `${this.baseUrl}/responses`;
    this.organization = parsedOptions.organization;
  }

  getDefaultBaseUrl(): UrlType {
    return this.baseUrl;
  }

  getDefaultHeaders(): HeadersType {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...(this.organization ? { "OpenAI-Organization": this.organization } : {}),
    };
  }

  getDefaultParams(): ParamsType {
    return {
      model: this.modelName,
    };
  }

  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number } {
    const parseDuration = (duration: string): number => {
      const regex = /(\d+)(h|m|s|ms)/g;
      const timeUnits: { [unit: string]: number } = {
        h: 3600000,
        m: 60000,
        s: 1000,
        ms: 1,
      };

      let match;
      let totalMs = 0;
      while ((match = regex.exec(duration)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];
        totalMs += value * timeUnits[unit];
      }

      return totalMs;
    };

    let resetRequestsDelayMs = 0;
    let resetTokensDelayMs = 0;
    const shouldRetry = true;
    if (responseHeaders["x-ratelimit-reset-requests"]) {
      resetRequestsDelayMs = parseDuration(responseHeaders["x-ratelimit-reset-requests"]);
    }
    if (responseHeaders["x-ratelimit-reset-tokens"]) {
      resetTokensDelayMs = parseDuration(responseHeaders["x-ratelimit-reset-tokens"]);
    }

    const delayMs = Math.max(resetRequestsDelayMs, resetTokensDelayMs);
    return { shouldRetry, delayMs };
  }

  getTokenCount(messages: MessageType[]): number {
    return messages.reduce((acc, message) => {
      return acc + message.content.map((content) => (content.modality === "text" ? content.value : "")).join(" ").length;
    }, 0);
  }

  // Transform raw API request format to internal format
  // Note: Responses API models typically receive pre-transformed requests
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transformModelRequest(request: any): {
    modelName: string | undefined;
    config: ConfigType;
    messages: MessageType[];
    tools: ToolType[] | undefined;
  } {
    throw new ModelResponseError({
      info: "transformModelRequest not supported for Responses API models",
      cause: new Error("Use the standard gateway interface with config, messages, and tools parameters"),
    });
  }

  // Responses API specific config transformation
  transformConfig(config: ConfigType, messages?: MessageType[], tools?: ToolType[]): ParamsType {
    const parsedConfig = Config().parse(config);
    const transformedConfig: ParamsType = {};

    // Map config keys to API params using model schema definition
    for (const key of Object.keys(this.modelSchema.config.def)) {
      const configItem = this.modelSchema.config.def[key as keyof typeof this.modelSchema.config.def];
      const paramKey = configItem?.param as string | undefined;
      if (paramKey && parsedConfig[key as keyof ConfigType] !== undefined) {
        transformedConfig[paramKey] = parsedConfig[key as keyof ConfigType];
      }
    }

    // Handle tool choice
    const toolChoice = parsedConfig.toolChoice;
    if (toolChoice !== undefined) {
      if (tools && tools.length > 0) {
        const toolChoiceValue = toolChoice as unknown as string;
        const toolNames = tools.map((tool) => tool.definition.schema.name);

        if (["none", "auto", "required"].includes(toolChoiceValue)) {
          transformedConfig.tool_choice = toolChoiceValue;
        } else if (toolNames.includes(toolChoiceValue)) {
          transformedConfig.tool_choice = { type: "function", function: { name: toolChoiceValue } };
        } else {
          throw new InvalidConfigError({
            info: `Invalid tool choice for model : '${this.modelName}'`,
            cause: new Error(`Tool with name '${toolChoiceValue}' not found in tools`),
          });
        }
      } else {
        throw new InvalidConfigError({
          info: `Invalid tool choice for model : '${this.modelName}'`,
          cause: new Error("Tools are required when tool_choice is specified"),
        });
      }
    }

    // Handle response format
    const responseFormat = parsedConfig.responseFormat as string | undefined;
    if (responseFormat !== undefined) {
      if (responseFormat === "json_schema") {
        if (!parsedConfig.responseSchema) {
          throw new InvalidConfigError({
            info: `Invalid response schema for model : '${this.modelName}'`,
            cause: new Error("Response schema is required when response format is 'json_schema'"),
          });
        }
        transformedConfig.response_format = {
          type: responseFormat,
          json_schema: transformedConfig.response_schema,
        };
        delete transformedConfig.response_schema;
      } else {
        transformedConfig.response_format = { type: responseFormat };
      }
    }

    // Responses API specific: Transform reasoning_effort to nested object
    if ("reasoning_effort" in transformedConfig && transformedConfig.reasoning_effort !== undefined) {
      transformedConfig.reasoning = {
        effort: transformedConfig.reasoning_effort,
      };
      delete transformedConfig.reasoning_effort;
    }

    // Responses API specific: Transform verbosity to nested object
    if ("verbosity" in transformedConfig && transformedConfig.verbosity !== undefined) {
      transformedConfig.text = {
        verbosity: transformedConfig.verbosity,
      };
      delete transformedConfig.verbosity;
    }

    return transformedConfig;
  }

  // Responses API specific message transformation using input_text/output_text
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

    // Validate modalities
    parsedMessages.forEach((message) => {
      message.content.forEach((content) => {
        if (!this.modelSchema.modalities.includes(content.modality)) {
          throw new InvalidMessagesError({
            info: `Invalid message content for model : '${this.modelName}'`,
            cause: new Error(`model : '${this.modelName}' does not support modality : '${content.modality}'`),
          });
        }
      });
    });

    // Validate roles
    parsedMessages.forEach((message) => {
      if (!Object.keys(this.modelSchema.roles).includes(message.role)) {
        throw new InvalidMessagesError({
          info: `Invalid message content for model : '${this.modelName}'`,
          cause: new Error(`model : '${this.modelName}' does not support role : '${message.role}'`),
        });
      }
    });

    const transformedMessages = parsedMessages.map((message) => {
      switch (message.role) {
        case SystemRoleLiteral: {
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
          const textContent: { type: "output_text"; text: string }[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              textContent.push({ type: "output_text", text: content.value });
            } else if (content.modality === ToolCallModalityLiteral) {
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
          const userContent: (
            | { type: "input_text"; text: string }
            | { type: "image_url"; image_url: { url: string; detail: string } }
          )[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              userContent.push({ type: "input_text", text: content.value });
            } else if (content.modality === ImageModalityLiteral) {
              const imageValue = content.value;
              const imageUrl =
                imageValue.type === "url" ? imageValue.url : (imageValue as Base64ImageContentValueType).base64;
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
            cause: new Error(`role : '${message.role}' is not supported`),
          });
        }
      }
    });

    return { messages: transformedMessages };
  }

  transformTools(tools: ToolType[]): ParamsType {
    if (!tools || tools.length === 0) {
      return { tools: [] as ToolType[] };
    }

    if (!this.modelSchema.modalities.includes(ToolCallModalityLiteral)) {
      throw new InvalidToolsError({
        info: `Invalid tool 'modality' for model : ${this.modelName}`,
        cause: new Error(`model : '${this.modelName}' does not support tool modality`),
      });
    }

    const parsedTools = tools.map((tool) => {
      const parsedTool = Tool().safeParse(tool);
      if (!parsedTool.success) {
        throw new InvalidToolsError({ info: "Invalid tools", cause: parsedTool.error });
      }
      return parsedTool.data;
    });

    const transformedTools = parsedTools.map((tool) => ({
      type: "function",
      function: tool.definition.schema,
    }));

    return { tools: transformedTools };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCompleteChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType> {
    return Promise.resolve(this.responsesUrl);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCompleteChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    return Promise.resolve(this.getDefaultHeaders());
  }

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

    for (const outputItem of output) {
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
      } else if ((outputItem?.type === "text" || outputItem?.type === "output_text") && outputItem?.text) {
        messages[0].content.push(createTextContent(outputItem.text));
      } else if (outputItem?.type === "tool_call" && outputItem.tool_call) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStreamChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType> {
    return Promise.resolve(this.responsesUrl);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStreamChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    return Promise.resolve({
      ...this.getDefaultHeaders(),
      Accept: "text/event-stream",
    });
  }

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

    return Promise.resolve({
      ...this.getDefaultParams(),
      ...transformedConfig,
      ...transformedTools,
      input: transformedMessages.messages,
      stream: true,
    });
  }

  async *transformStreamChatResponseChunk(
    chunk: string,
    buffer: string
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    const data = buffer + chunk;
    const lines: string[] = [];
    let newBuffer = "";

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

          // Handle delta events - Responses API sends delta as a STRING
          if (structuredLine.type === "response.output_text.delta" || structuredLine.type === "output_text.delta") {
            if (typeof structuredLine.delta === "string" && structuredLine.delta.length > 0) {
              partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, structuredLine.delta));
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

          // Handle legacy format support
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

          // Handle final output events
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
                structuredLine.usage.input_tokens ?? structuredLine.usage.prompt_tokens ?? 0,
              completionTokens:
                structuredLine.usage.output_tokens ?? structuredLine.usage.completion_tokens ?? 0,
              totalTokens:
                structuredLine.usage.total_tokens ??
                (structuredLine.usage.input_tokens || 0) + (structuredLine.usage.output_tokens || 0),
            };
          }

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

    return;
  }

  async *transformProxyStreamChatResponseChunk(
    chunk: string,
    buffer: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data?: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    headers?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query?: Record<string, string>
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    yield* this.transformStreamChatResponseChunk(chunk, buffer);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProxyStreamChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType> {
    return Promise.resolve(this.responsesUrl);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProxyCompleteChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType> {
    return Promise.resolve(this.responsesUrl);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProxyCompleteChatHeaders(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<HeadersType> {
    if (!headers) {
      return {};
    }
    const sanitizedHeaders: Record<string, string> = { ...headers };
    delete sanitizedHeaders.host;
    delete sanitizedHeaders["content-length"];
    return sanitizedHeaders;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProxyStreamChatHeaders(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<HeadersType> {
    const baseHeaders = await this.getProxyCompleteChatHeaders(data, headers, query);
    return {
      ...baseHeaders,
      Accept: "text/event-stream",
    };
  }

  getModelPricing(): ChatModelPriceType {
    if (!(this.modelName in pricingData)) {
      throw new ModelResponseError({
        info: `Invalid model pricing for model : '${this.modelName}'`,
        cause: new Error(`No pricing configuration found for model "${this.modelName}"`),
      });
    }

    const entry = pricingData[this.modelName as keyof typeof pricingData];
    return entry as ChatModelPriceType;
  }
}

export {
  BaseChatModelResponsesApi,
  BaseChatModelResponsesApiOptions,
  type BaseChatModelResponsesApiOptionsType,
};

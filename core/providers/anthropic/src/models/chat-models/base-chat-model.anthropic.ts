import { z } from "zod";

import {
  ChatModelSchemaType,
  ChatModelV1,
  HeadersType,
  InvalidConfigError,
  InvalidMessagesError,
  InvalidModelRequestError,
  InvalidToolsError,
  ModelResponseError,
  ParamsType,
  removeUndefinedEntries,
  SelectStringConfigItemDefType,
  UrlType,
  urlWithoutTrailingSlash,
} from "@adaline/provider";
import {
  AssistantRoleLiteral,
  Base64ImageContentTypeLiteral,
  Base64ImageContentValueType,
  ChatResponseType,
  ChatUsageType,
  Config,
  ConfigType,
  ContentType,
  createPartialReasoningMessage,
  createPartialRedactedReasoningMessage,
  createPartialTextMessage,
  createPartialToolCallMessage,
  createReasoningContent,
  createRedactedReasoningContent,
  createTextContent,
  createToolCallContent,
  ImageContentType,
  ImageModalityLiteral,
  Message,
  MessageType,
  PartialChatResponseType,
  PartialMessageType,
  ReasoningModalityLiteral,
  SystemRoleLiteral,
  TextModalityLiteral,
  Tool,
  ToolCallContentType,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ToolRoleLiteral,
  ToolType,
  UserRoleLiteral,
} from "@adaline/types";

import { Anthropic } from "../../provider/provider.anthropic";
import {
  AnthropicCompleteChatResponse,
  AnthropicCompleteChatResponseType,
  AnthropicRequest,
  AnthropicRequestAssistantMessageType,
  AnthropicRequestImageContentType,
  AnthropicRequestRedactedThinkingContentType,
  AnthropicRequestTextContentType,
  AnthropicRequestThinkingContentType,
  AnthropicRequestToolCallContentType,
  AnthropicRequestToolResponseContentType,
  AnthropicRequestToolType,
  AnthropicRequestType,
  AnthropicRequestUserMessageType,
  AnthropicStreamChatContentBlockDeltaResponse,
  AnthropicStreamChatContentBlockStartResponse,
  AnthropicStreamChatMessageDeltaResponse,
  AnthropicStreamChatMessageStartResponse,
} from "./types";

const BaseChatModelOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
  completeChatUrl: z.string().url().optional(),
  streamChatUrl: z.string().url().optional(),
});
type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

class BaseChatModel implements ChatModelV1<ChatModelSchemaType> {
  readonly version = "v1" as const;
  readonly modelName: string;
  modelSchema: ChatModelSchemaType;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly completeChatUrl: string;
  private readonly streamChatUrl: string;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.apiKey = parsedOptions.apiKey;
    this.baseUrl = urlWithoutTrailingSlash(Anthropic.chatBaseUrl);
    this.completeChatUrl = urlWithoutTrailingSlash(parsedOptions.completeChatUrl || `${this.baseUrl}/messages`);
    this.streamChatUrl = urlWithoutTrailingSlash(parsedOptions.streamChatUrl || `${this.baseUrl}/messages`);
  }

  getDefaultBaseUrl(): UrlType {
    return this.baseUrl;
  }

  getDefaultHeaders(): HeadersType {
    return {
      "x-api-key": `${this.apiKey}`,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    };
  }

  getDefaultParams(): ParamsType {
    return {
      model: this.modelName,
    };
  }

  // TODO: needs testing, implement the same for all providers
  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number } {
    let retryAfterMs = 0;
    let shouldRetry = true;
    if (responseHeaders["x-should-retry"]) {
      shouldRetry = responseHeaders["x-should-retry"].toLowerCase() === "false" ? false : true;
    }
    if (responseHeaders["retry-after"]) {
      retryAfterMs = parseInt(responseHeaders["retry-after"]) * 1000;
    }

    const delayMs = retryAfterMs;
    return { shouldRetry, delayMs };
  }

  // TODO: unused method, not tested; should add support for non-text modalities, tools, implement the same for all providers
  getTokenCount(messages: MessageType[]): number {
    return messages.reduce((acc, message) => {
      return acc + message.content.map((content) => (content.modality === "text" ? content.value : "")).join(" ").length;
    }, 0);
  }

  transformModelRequest(request: any): {
    modelName: string | undefined;
    config: ConfigType;
    messages: MessageType[];
    tools: ToolType[] | undefined;
  } {
    const safeRequest = AnthropicRequest.safeParse(request);
    if (!safeRequest.success) {
      throw new InvalidModelRequestError({ info: "Invalid model request", cause: safeRequest.error });
    }

    const parsedRequest = safeRequest.data;

    const modelName = parsedRequest.model;

    if (parsedRequest.tool_choice && (!parsedRequest.tools || parsedRequest.tools.length === 0)) {
      throw new InvalidModelRequestError({
        info: `Invalid model request for model : '${this.modelName}'`,
        cause: new Error("'tools' are required when 'tool_choice' is specified"),
      });
    }

    const _config: ConfigType = {};
    if (parsedRequest.tool_choice) {
      if (parsedRequest.tool_choice.type === "tool") {
        _config.toolChoice = parsedRequest.tool_choice.name;
      } else {
        _config.toolChoice = parsedRequest.tool_choice.type;
      }
    }

    _config.maxTokens = parsedRequest.max_tokens;
    _config.temperature = parsedRequest.temperature;
    _config.topP = parsedRequest.top_p;
    _config.topK = parsedRequest.top_k;
    _config.stop = parsedRequest.stop_sequences;

    const config = Config().parse(removeUndefinedEntries(_config));

    const messages: MessageType[] = [];
    const toolCallMap: { [id: string]: ToolCallContentType } = {};
    if (parsedRequest.system) {
      messages.push({
        role: SystemRoleLiteral,
        content: [{ modality: TextModalityLiteral, value: parsedRequest.system }],
      });
    }

    parsedRequest.messages.forEach((message) => {
      const role = message.role;
      switch (role) {
        case "user":
          {
            const content = message.content as
              | string
              | (AnthropicRequestTextContentType | AnthropicRequestImageContentType | AnthropicRequestToolResponseContentType)[];
            if (typeof content === "string") {
              messages.push({
                role: role,
                content: [{ modality: TextModalityLiteral, value: content }],
              });
            } else {
              const _content = content.map((c) => {
                if (c.type === "text") {
                  return { modality: TextModalityLiteral, value: c.text };
                } else if (c.type === "image") {
                  const defaultDetail = "auto" as ImageContentType["detail"];
                  const mediaType = c.source.media_type.split("/")[1] as Base64ImageContentValueType["media_type"];
                  return {
                    modality: ImageModalityLiteral,
                    detail: defaultDetail,
                    value: { type: Base64ImageContentTypeLiteral, media_type: mediaType, base64: c.source.data },
                  };
                } else {
                  return {
                    modality: ToolResponseModalityLiteral,
                    id: c.tool_use_id,
                    index: toolCallMap[c.tool_use_id].index,
                    name: toolCallMap[c.tool_use_id].name,
                    data: typeof c.content === "string" ? c.content : JSON.stringify(c.content),
                  };
                }
              });
              messages.push({
                role: role,
                content: _content,
              });
            }
          }
          break;

        case "assistant":
          {
            const content = message.content as string | (AnthropicRequestTextContentType | AnthropicRequestToolCallContentType)[];
            if (typeof content === "string") {
              messages.push({
                role: role,
                content: [{ modality: TextModalityLiteral, value: content }],
              });
            } else {
              const _content = content.map((c, index) => {
                if (c.type === "text") {
                  return { modality: TextModalityLiteral, value: c.text };
                } else {
                  const toolCallContent: ToolCallContentType = {
                    modality: ToolCallModalityLiteral,
                    id: c.id,
                    index: index,
                    name: c.name,
                    arguments: JSON.stringify(c.input),
                  };
                  toolCallMap[c.id] = toolCallContent;
                  return toolCallContent;
                }
              });
              messages.push({
                role: role,
                content: _content,
              });
            }
          }
          break;
      }
    });

    const tools: ToolType[] = [];
    if (parsedRequest.tools) {
      parsedRequest.tools.forEach((tool: AnthropicRequestToolType) => {
        tools.push({
          type: "function",
          definition: {
            schema: {
              name: tool.name,
              description: tool.description || "",
              parameters: tool.input_schema,
            },
          },
        });
      });
    }

    return {
      modelName,
      config,
      messages,
      tools: tools.length > 0 ? tools : undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transformConfig(config: ConfigType, messages?: MessageType[], tools?: ToolType[]): ParamsType {
    const _toolChoice = config.toolChoice;
    const _reasoningEnabled = config.reasoningEnabled;
    const _maxReasoningTokens = config.maxReasoningTokens;

    const _config = { ...config }; // create a copy to avoid mutating original config

    delete _config.toolChoice; // can have a specific tool name that is not in the model schema, validated at transformation
    delete _config.reasoningEnabled;
    delete _config.maxReasoningTokens;

    const _parsedConfig = this.modelSchema.config.schema.safeParse(_config);
    if (!_parsedConfig.success) {
      throw new InvalidConfigError({
        info: `Invalid config for model : '${this.modelName}'`,
        cause: _parsedConfig.error,
      });
    }

    const parsedConfig = _parsedConfig.data as ConfigType;
    if (_toolChoice !== undefined) {
      parsedConfig.toolChoice = _toolChoice;
    }

    Object.keys(parsedConfig).forEach((key) => {
      if (!(key in this.modelSchema.config.def)) {
        throw new InvalidConfigError({
          info: `Invalid config for model : '${this.modelName}'`,
          cause: new Error(`Invalid config key : '${key}', 
            available keys : [${Object.keys(this.modelSchema.config.def).join(", ")}]`),
        });
      }
    });

    const transformedConfig = Object.keys(parsedConfig).reduce((acc, key) => {
      const def = this.modelSchema.config.def[key];
      const paramKey = def.param;
      const paramValue = (parsedConfig as ConfigType)[key];

      if (paramKey === "max_tokens" && def.type === "range" && paramValue === 0) {
        acc[paramKey] = def.max;
      } else {
        acc[paramKey] = paramValue;
      }

      return acc;
    }, {} as ParamsType);

    if (!transformedConfig.max_tokens) {
      const def = this.modelSchema.config.def.maxTokens as { max: number };
      transformedConfig.max_tokens = def["max"];
    }

    if ("tool_choice" in transformedConfig && transformedConfig.tool_choice !== undefined) {
      const toolChoice = transformedConfig.tool_choice as string;
      if (!tools || (tools && tools.length === 0)) {
        throw new InvalidConfigError({
          info: `Invalid config for model : '${this.modelName}'`,
          cause: new Error("'tools' are required when 'toolChoice' is specified"),
        });
      } else if (tools && tools.length > 0) {
        const configToolChoice = this.modelSchema.config.def.toolChoice as SelectStringConfigItemDefType;
        if (configToolChoice.choices.includes(toolChoice)) {
          transformedConfig.tool_choice = { type: toolChoice };
        } else if (tools.map((tool) => tool.definition.schema.name).includes(toolChoice)) {
          transformedConfig.tool_choice = { type: "tool", name: toolChoice };
        } else {
          throw new InvalidConfigError({
            info: `Invalid config for model : '${this.modelName}'`,
            cause: new Error(`toolChoice : '${toolChoice}' is not part of provided 'tools' names or 
              one of [${configToolChoice.choices.join(", ")}]`),
          });
        }
      }
    }

    const hasExtendedThinking = _reasoningEnabled !== undefined;
    const hasThinkingTokens = _maxReasoningTokens !== undefined;

    if (hasExtendedThinking !== hasThinkingTokens) {
      throw new InvalidConfigError({
        info: `Invalid extended thinking config for model: '${this.modelName}'`,
        cause: new Error(`Both 'extendedThinking' and 'maxReasoningTokens' must be defined together.`),
      });
    }

    if (hasExtendedThinking && hasThinkingTokens) {
      const maxTokens = transformedConfig.max_tokens;

      if (_reasoningEnabled) {
        if (_maxReasoningTokens < maxTokens) {
          transformedConfig.thinking = {
            type: "enabled",
            budget_tokens: _maxReasoningTokens,
          };
        } else {
          throw new InvalidConfigError({
            info: `Invalid extended thinking token budget for model: '${this.modelName}'`,
            cause: new Error(`maxReasoningTokens (${_maxReasoningTokens}) must be less than max_tokens (${maxTokens})`),
          });
        }
      }
    }

    return transformedConfig;
  }

  transformMessages(messages: MessageType[]): ParamsType {
    if (!messages || (messages && messages.length === 0)) {
      return { messages: [] };
    }

    // Helper function to remove base64 data URL prefix if present.
    const stripBase64Prefix = (data: string): string => {
      const prefixMatch = data.match(/^data:image\/[a-zA-Z]+;base64,/);
      if (prefixMatch) {
        return data.substring(prefixMatch[0].length);
      }
      return data;
    };

    const parsedMessages = messages.map((message) => {
      const parsedMessage = Message().safeParse(message);
      if (!parsedMessage.success) {
        throw new InvalidMessagesError({
          info: "Invalid messages",
          cause: parsedMessage.error,
        });
      }
      return parsedMessage.data;
    });

    parsedMessages.forEach((message) => {
      message.content.forEach((content) => {
        if (!this.modelSchema.modalities.includes(content.modality)) {
          throw new InvalidMessagesError({
            info: `Invalid message content for model : '${this.modelName}'`,
            cause: new Error(
              `model : '${this.modelName}' does not support modality : '${content.modality}', available modalities : [${this.modelSchema.modalities.join(
                ", "
              )}]`
            ),
          });
        }
      });
    });

    parsedMessages.forEach((message) => {
      if (!Object.keys(this.modelSchema.roles).includes(message.role)) {
        throw new InvalidMessagesError({
          info: `Invalid message content for model : '${this.modelName}'`,
          cause: new Error(
            `model : '${this.modelName}' does not support role : '${message.role}', available roles : [${Object.keys(
              this.modelSchema.roles
            ).join(", ")}]`
          ),
        });
      }
    });

    let systemMessage: AnthropicRequestType["system"] = "";
    const nonSystemMessages: {
      role: AnthropicRequestAssistantMessageType["role"] | AnthropicRequestUserMessageType["role"];
      content: (
        | AnthropicRequestTextContentType
        | AnthropicRequestImageContentType
        | AnthropicRequestToolCallContentType
        | AnthropicRequestToolResponseContentType
        | AnthropicRequestThinkingContentType
        | AnthropicRequestRedactedThinkingContentType
      )[];
    }[] = [];

    parsedMessages.forEach((message) => {
      switch (message.role) {
        case SystemRoleLiteral: {
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              systemMessage += content.value;
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          });
          break;
        }
        case AssistantRoleLiteral: {
          const assistantContent: (
            | AnthropicRequestTextContentType
            | AnthropicRequestToolCallContentType
            | AnthropicRequestThinkingContentType
            | AnthropicRequestRedactedThinkingContentType
          )[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              assistantContent.push({ type: "text", text: content.value });
            } else if (content.modality === ToolCallModalityLiteral) {
              assistantContent.push({
                type: "tool_use",
                id: content.id,
                name: content.name,
                input: JSON.parse(content.arguments),
              });
            } else if (content.modality === ReasoningModalityLiteral && content.value.type === "thinking") {
              assistantContent.push({
                type: "thinking",
                thinking: content.value.thinking,
                signature: content.value.signature,
              });
            } else if (content.modality === ReasoningModalityLiteral && content.value.type === "redacted") {
              assistantContent.push({
                type: "redacted_thinking",
                data: content.value.data,
              });
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          });
          nonSystemMessages.push({
            role: this.modelSchema.roles[message.role] as AnthropicRequestAssistantMessageType["role"],
            content: assistantContent,
          });
          break;
        }
        case UserRoleLiteral: {
          const userContent: (AnthropicRequestTextContentType | AnthropicRequestImageContentType)[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              userContent.push({ type: "text", text: content.value });
            } else if (content.modality === ImageModalityLiteral) {
              if (content.value.type === "base64") {
                let base64Data = content.value.base64;
                // Check and strip the data URL prefix if it exists.
                base64Data = stripBase64Prefix(base64Data);
                userContent.push({
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: `image/${content.value.media_type}` as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                    data: base64Data,
                  },
                });
              } else if (content.value.type === "url") {
                // TODO: add logic to fetch image from url, remove this error
                throw new InvalidMessagesError({
                  info: `Invalid message 'modality' for model : ${this.modelName}`,
                  cause: new Error(`model: '${this.modelName}' does not support image content type: '${content.value.type}'`),
                });
              }
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          });
          nonSystemMessages.push({
            role: this.modelSchema.roles[message.role] as AnthropicRequestUserMessageType["role"],
            content: userContent,
          });
          break;
        }
        case ToolRoleLiteral: {
          const toolContent: AnthropicRequestToolResponseContentType[] = [];
          message.content.forEach((content) => {
            if (content.modality === ToolResponseModalityLiteral) {
              toolContent.push({
                type: "tool_result",
                tool_use_id: content.id,
                content: content.data,
              });
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          });
          nonSystemMessages.push({
            role: this.modelSchema.roles[message.role] as "user",
            content: toolContent,
          });
          break;
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

    if (nonSystemMessages[0].role !== this.modelSchema.roles[UserRoleLiteral]) {
      throw new InvalidMessagesError({
        info: `Invalid message 'role' for model : ${this.modelName}`,
        cause: new Error(`model : '${this.modelName}' requires first message to be from user`),
      });
    }

    return {
      system: systemMessage,
      messages: nonSystemMessages,
    };
  }

  transformTools(tools: ToolType[]): ParamsType {
    if (!this.modelSchema.modalities.includes(ToolCallModalityLiteral)) {
      throw new InvalidToolsError({
        info: `Invalid tool 'modality' for model : ${this.modelName}`,
        cause: new Error(`model : '${this.modelName}' does not support tool modality : '${ToolCallModalityLiteral}'`),
      });
    }

    if (!tools || (tools && tools.length === 0)) {
      return { tools: [] as ToolType[] };
    }

    const parsedTools = tools.map((tool) => {
      const parsedTool = Tool().safeParse(tool);
      if (!parsedTool.success) {
        throw new InvalidToolsError({ info: "Invalid tools", cause: parsedTool.error });
      }
      return parsedTool.data;
    });

    const transformedTools = parsedTools.map((tool) => ({
      name: tool.definition.schema.name,
      description: tool.definition.schema.description,
      input_schema: tool.definition.schema.parameters,
    }));

    return { tools: transformedTools };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCompleteChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType> {
    return new Promise((resolve) => {
      resolve(this.completeChatUrl);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCompleteChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    let headers = this.getDefaultHeaders();
    headers = {
      ...headers,
      "anthropic-beta": "output-128k-2025-02-19",
    };

    return new Promise((resolve) => {
      resolve(headers);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    return new Promise((resolve) => {
      resolve({
        ...this.getDefaultParams(),
        ...transformedConfig,
        ...transformedMessages,
        ...transformedTools,
      });
    });
  }

  transformCompleteChatResponse(response: any): ChatResponseType {
    const safe = AnthropicCompleteChatResponse.safeParse(response);
    if (safe.success) {
      const parsedResponse: AnthropicCompleteChatResponseType = safe.data;
      const _content = parsedResponse.content;
      const content = _content.map((contentItem, index) => {
        if (contentItem.type === "text") {
          return createTextContent(contentItem.text);
        } else if (contentItem.type === "tool_use") {
          return createToolCallContent(index, contentItem.id, contentItem.name, JSON.stringify(contentItem.input));
        } else if (contentItem.type === "thinking") {
          return createReasoningContent(contentItem.thinking, contentItem.signature);
        } else if (contentItem.type === "redacted_thinking") {
          return createRedactedReasoningContent(contentItem.data);
        }
      }) as ContentType[];

      const messages: MessageType[] = [
        {
          role: AssistantRoleLiteral,
          content: content,
        },
      ];

      const usage: ChatUsageType = {
        promptTokens: parsedResponse.usage.input_tokens,
        completionTokens: parsedResponse.usage.output_tokens,
        totalTokens: parsedResponse.usage.input_tokens + parsedResponse.usage.output_tokens,
      };

      return {
        messages: messages,
        usage: usage,
        logProbs: [],
      };
    }

    throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStreamChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType> {
    return new Promise((resolve) => {
      resolve(this.streamChatUrl);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getStreamChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    let headers = this.getDefaultHeaders();

    headers = {
      ...headers,
      "anthropic-beta": "output-128k-2025-02-19",
    };

    return new Promise((resolve) => {
      resolve(headers);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    return new Promise((resolve) => {
      resolve({
        stream: true,
        ...this.getDefaultParams(),
        ...transformedConfig,
        ...transformedMessages,
        ...transformedTools,
      });
    });
  }

  async *transformStreamChatResponseChunk(
    chunk: string,
    buffer: string
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    // merge last buffer message and split into lines
    const lines = (buffer + chunk).split("\n").filter((line) => line.trim() !== "");
    for (const line of lines) {
      if (line.startsWith("data: {") && line.endsWith("}")) {
        // line contains message
        let structuredLine: any;
        try {
          // remove the 'data: ' prefix from string JSON
          structuredLine = JSON.parse(line.substring("data: ".length));
        } catch (error) {
          // malformed JSON error
          throw new ModelResponseError({
            info: `Malformed JSON received in stream : ${structuredLine}`,
            cause: error,
          });
        }

        if (!("type" in structuredLine)) {
          // Invalid JSON error
          throw new ModelResponseError({
            info: "Invalid JSON received in stream",
            cause: new Error(`Invalid JSON received in stream, expected 'type' property, received: ${JSON.stringify(structuredLine)}`),
          });
        } else if (structuredLine.type === "message_stop") {
          return;
        } else if (structuredLine.type === "message_start") {
          const safe = AnthropicStreamChatMessageStartResponse.safeParse(structuredLine);
          if (safe.success) {
            const parsedResponse = safe.data;
            yield {
              partialResponse: {
                partialMessages: [],
                usage: {
                  promptTokens: parsedResponse.message.usage.input_tokens,
                  completionTokens: parsedResponse.message.usage.output_tokens,
                  totalTokens: parsedResponse.message.usage.input_tokens + parsedResponse.message.usage.output_tokens,
                },
              },
              buffer: buffer,
            };
          } else {
            throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
          }
        } else if (structuredLine.type === "message_delta") {
          const safe = AnthropicStreamChatMessageDeltaResponse.safeParse(structuredLine);
          if (safe.success) {
            const parsedResponse = safe.data;
            yield {
              partialResponse: {
                partialMessages: [],
                usage: {
                  promptTokens: 0,
                  completionTokens: parsedResponse.usage.output_tokens,
                  totalTokens: parsedResponse.usage.output_tokens,
                },
              },
              buffer: buffer,
            };
          } else {
            throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
          }
        } else if (structuredLine.type === "content_block_start") {
          const safe = AnthropicStreamChatContentBlockStartResponse.safeParse(structuredLine);
          if (safe.success) {
            const parsedResponse = safe.data;
            const partialMessages: PartialMessageType[] = [];
            if (parsedResponse.content_block.type === "text") {
              partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, parsedResponse.content_block.text));
            } else if (parsedResponse.content_block.type === "tool_use") {
              partialMessages.push(
                createPartialToolCallMessage(
                  AssistantRoleLiteral,
                  parsedResponse.index,
                  parsedResponse.content_block.id,
                  parsedResponse.content_block.name,
                  ""
                )
              );
            } else if (parsedResponse.content_block.type === "thinking") {
              partialMessages.push(createPartialReasoningMessage(AssistantRoleLiteral, parsedResponse.content_block.thinking));
            } else if (parsedResponse.content_block.type === "redacted_thinking") {
              partialMessages.push(createPartialRedactedReasoningMessage(AssistantRoleLiteral, parsedResponse.content_block.data));
            }

            yield { partialResponse: { partialMessages: partialMessages }, buffer: buffer };
          } else {
            throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
          }
        } else if (structuredLine.type === "content_block_delta") {
          const safe = AnthropicStreamChatContentBlockDeltaResponse.safeParse(structuredLine);
          if (safe.success) {
            const parsedResponse = safe.data;
            const partialMessages: PartialMessageType[] = [];
            if (parsedResponse.delta.type === "text_delta") {
              partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, parsedResponse.delta.text));
            } else if (parsedResponse.delta.type === "input_json_delta") {
              partialMessages.push(
                createPartialToolCallMessage(AssistantRoleLiteral, parsedResponse.index, "", "", parsedResponse.delta.partial_json)
              );
            } else if (parsedResponse.delta.type === "thinking_delta") {
              partialMessages.push(createPartialReasoningMessage(AssistantRoleLiteral, parsedResponse.delta.thinking));
            } else if (parsedResponse.delta.type === "signature_delta") {
              partialMessages.push(createPartialReasoningMessage(AssistantRoleLiteral, undefined, parsedResponse.delta.signature));
            }

            yield { partialResponse: { partialMessages: partialMessages }, buffer: buffer };
          } else {
            throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
          }
        } else {
          // line starts with a known event that is not implemented -- ignore
        }
      } else {
        // line starts with unknown event -- ignore
      }
    }
  }

  async *transformProxyStreamChatResponseChunk(
    chunk: string,
    buffer: string,
    data?: any,
    headers?: Record<string, string>,
    query?: Record<string, string>
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    // Directly delegate to transformStreamChatResponseChunk
    yield* this.transformStreamChatResponseChunk(chunk, buffer);
  }

  async getProxyStreamChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType> {
    return new Promise((resolve) => {
      resolve(this.streamChatUrl);
    });
  }
  async getProxyCompleteChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType> {
    return new Promise((resolve) => {
      resolve(this.completeChatUrl);
    });
  }

  async getProxyCompleteChatHeaders(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<HeadersType> {
    if (!headers) {
      return {};
    }
    const sanitizedHeaders: Record<string, string> = { ...headers };

    delete sanitizedHeaders.host;
    delete sanitizedHeaders["content-length"];
    return sanitizedHeaders;
  }

  async getProxyStreamChatHeaders(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<HeadersType> {
    // Directly delegate to getProxyCompleteChatHeaders for now
    return await this.getProxyCompleteChatHeaders(data, headers, query);
  }
}

export { BaseChatModel, BaseChatModelOptions, type BaseChatModelOptionsType };

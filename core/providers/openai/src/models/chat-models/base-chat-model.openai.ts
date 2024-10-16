import { z } from "zod";

import {
  ChatModelSchemaType,
  ChatModelV1,
  getMimeTypeFromBase64,
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
  ChatLogProbsType,
  ChatResponseType,
  ChatUsageType,
  Config,
  ConfigType,
  ContentType,
  createPartialTextMessage,
  createPartialToolCallMessage,
  createTextMessage,
  createToolCallMessage,
  ImageModalityLiteral,
  Message,
  MessageType,
  PartialChatResponseType,
  SystemRoleLiteral,
  TextModalityLiteral,
  Tool,
  ToolCallContentType,
  ToolCallModalityLiteral,
  ToolResponseContentType,
  ToolResponseModalityLiteral,
  ToolRoleLiteral,
  ToolType,
  UrlImageContentTypeLiteral,
  UserRoleLiteral,
} from "@adaline/types";

import {
  OpenAIChatRequest,
  OpenAIChatRequestImageContentType,
  OpenAIChatRequestTextContentType,
  OpenAIChatRequestToolType,
  OpenAIChatRequestType,
  OpenAICompleteChatResponse,
  OpenAICompleteChatResponseType,
  OpenAIStreamChatResponse,
  OpenAIStreamChatResponseType,
} from "./types";

import { OpenAI } from "./../../provider/provider.openai";

const BaseChatModelOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().url().optional(),
  completeChatUrl: z.string().url().optional(),
  streamChatUrl: z.string().url().optional(),
  organization: z.string().optional(),
});
type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

class BaseChatModel implements ChatModelV1<ChatModelSchemaType> {
  readonly version = "v1" as const;
  modelSchema: ChatModelSchemaType;
  modelName: string;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly streamChatUrl: string;
  private readonly completeChatUrl: string;
  private readonly organization: string | undefined;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.apiKey = parsedOptions.apiKey;
    this.baseUrl = urlWithoutTrailingSlash(parsedOptions.baseUrl || OpenAI.baseUrl);
    this.streamChatUrl = urlWithoutTrailingSlash(parsedOptions.streamChatUrl || `${this.baseUrl}/chat/completions`);
    this.completeChatUrl = urlWithoutTrailingSlash(parsedOptions.completeChatUrl || `${this.baseUrl}/chat/completions`);
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

  // x-ratelimit-limit-requests	The maximum number of requests that are permitted before exhausting the rate limit.
  // x-ratelimit-limit-tokens	The maximum number of tokens that are permitted before exhausting the rate limit.
  // x-ratelimit-remaining-requests The remaining number of requests that are permitted before exhausting the rate limit.
  // x-ratelimit-remaining-tokens	The remaining number of tokens that are permitted before exhausting the rate limit.
  // x-ratelimit-reset-requests	The time until the rate limit (based on requests) resets to its initial state.
  // x-ratelimit-reset-tokens	The time until the rate limit (based on tokens) resets to its initial state.
  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number } {
    // parse duration from header value of format "6m0s" or "21s" or "41ms" or "2s81ms" or "5h50m30ms" and such
    const parseDuration = (duration: string): number => {
      const regex = /(\d+)(h|m|s|ms)/g;
      const timeUnits: { [unit: string]: number } = {
        h: 3600000, // 1 hour = 60 * 60 * 1000 ms
        m: 60000, // 1 minute = 60 * 1000 ms
        s: 1000, // 1 second = 1000 ms
        ms: 1, // milliseconds
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

    // if rate limited by requests, then it's reset must be the higher of two and visa versa
    const delayMs = Math.max(resetRequestsDelayMs, resetTokensDelayMs);
    return { shouldRetry, delayMs };
  }

  getTokenCount(messages: MessageType[]): number {
    return messages.reduce((acc, message) => {
      return acc + message.content.map((content) => (content.modality === "text" ? content.value : "")).join(" ").length;
    }, 0);
  }

  transformModelRequest(request: OpenAIChatRequestType): {
    modelName: string | undefined;
    config: ConfigType;
    messages: MessageType[];
    tools: ToolType[] | undefined;
  } {
    const safeRequest = OpenAIChatRequest.safeParse(request);
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
    if (parsedRequest.response_format) {
      _config.responseFormat = parsedRequest.response_format.type;
      if (parsedRequest.response_format.type === "json_schema") {
        _config.responseSchema = {
          name: parsedRequest.response_format.json_schema.name,
          description: parsedRequest.response_format.json_schema.description || "",
          strict: parsedRequest.response_format.json_schema.strict,
          schema: parsedRequest.response_format.json_schema.schema,
        };
      }
    }

    if (parsedRequest.tool_choice) {
      if (typeof parsedRequest.tool_choice === "string") {
        _config.toolChoice = parsedRequest.tool_choice;
      } else {
        _config.toolChoice = parsedRequest.tool_choice.function.name;
      }
    }

    _config.seed = parsedRequest.seed;
    _config.maxTokens = parsedRequest.max_tokens;
    _config.temperature = parsedRequest.temperature;
    _config.topP = parsedRequest.top_p;
    _config.presencePenalty = parsedRequest.presence_penalty;
    _config.frequencyPenalty = parsedRequest.frequency_penalty;
    _config.stop = parsedRequest.stop;
    _config.logProbs = parsedRequest.logprobs;
    _config.topLogProbs = parsedRequest.top_logprobs;

    const config = Config().parse(removeUndefinedEntries(_config));

    const messages: MessageType[] = [];
    const toolCallMap: { [id: string]: ToolCallContentType } = {};
    parsedRequest.messages.forEach((message) => {
      const role = message.role;
      switch (role) {
        case "system":
          {
            const content = message.content as string | OpenAIChatRequestTextContentType[];
            if (typeof content === "string") {
              messages.push({
                role: role,
                content: [{ modality: TextModalityLiteral, value: content }],
              });
            } else {
              const _content = content.map((c) => {
                return { modality: TextModalityLiteral, value: c.text };
              });
              messages.push({ role: role, content: _content });
            }
          }
          break;

        case "user":
          {
            const content = message.content as string | (OpenAIChatRequestTextContentType | OpenAIChatRequestImageContentType)[];
            if (typeof content === "string") {
              messages.push({
                role: role,
                content: [{ modality: TextModalityLiteral, value: content }],
              });
            } else {
              const _content = content.map((c) => {
                if (c.type === "text") {
                  return { modality: TextModalityLiteral, value: c.text };
                } else {
                  if (c.image_url.url.startsWith("data:")) {
                    return {
                      modality: ImageModalityLiteral,
                      detail: c.image_url.detail || "auto",
                      value: {
                        type: Base64ImageContentTypeLiteral,
                        base64: c.image_url.url,
                        media_type: getMimeTypeFromBase64(c.image_url.url) as Base64ImageContentValueType["media_type"],
                      },
                    };
                  } else {
                    return {
                      modality: ImageModalityLiteral,
                      detail: c.image_url.detail || "auto",
                      value: { type: UrlImageContentTypeLiteral, url: c.image_url.url },
                    };
                  }
                }
              });
              messages.push({ role: role, content: _content });
            }
          }
          break;

        case "assistant":
          {
            const assistantContent: ContentType[] = [];

            if (!message.content && !message.tool_calls) {
              throw new InvalidModelRequestError({
                info: `Invalid model request for model : '${this.modelName}'`,
                cause: new Error("one of'content' or 'tool_calls' must be provided"),
              });
            }

            if (message.content) {
              const content = message.content as string | OpenAIChatRequestTextContentType[];
              if (typeof content === "string") {
                assistantContent.push({ modality: TextModalityLiteral, value: content });
              } else {
                content.forEach((c) => {
                  assistantContent.push({ modality: TextModalityLiteral, value: c.text });
                });
              }
            }

            if (message.tool_calls) {
              const toolCalls = message.tool_calls;
              toolCalls.forEach((toolCall, index) => {
                const toolCallContent: ToolCallContentType = {
                  modality: ToolCallModalityLiteral,
                  id: toolCall.id,
                  index: index,
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments,
                };
                assistantContent.push(toolCallContent);
                toolCallMap[toolCallContent.id] = toolCallContent;
              });
            }
            messages.push({ role: role, content: assistantContent });
          }
          break;

        case "tool":
          {
            const toolResponse = message;
            messages.push({
              role: role,
              content: [
                {
                  modality: ToolResponseModalityLiteral,
                  id: toolResponse.tool_call_id,
                  index: toolCallMap[toolResponse.tool_call_id].index,
                  name: toolCallMap[toolResponse.tool_call_id].name,
                  data: toolResponse.content,
                },
              ],
            });
          }
          break;
      }
    });

    const tools: ToolType[] = [];
    if (parsedRequest.tools) {
      parsedRequest.tools.forEach((tool: OpenAIChatRequestToolType) => {
        tools.push({
          type: "function",
          definition: {
            schema: {
              name: tool.function.name,
              description: tool.function.description || "",
              strict: tool.function.strict,
              parameters: tool.function.parameters,
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
    delete config.toolChoice; // can have a specific tool name that is not in the model schema, validated at transformation

    const _parsedConfig = this.modelSchema.config.schema.safeParse(config);
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

    if (transformedConfig.top_logprobs && !transformedConfig.logprobs) {
      throw new InvalidConfigError({
        info: `Invalid config for model : '${this.modelName}'`,
        cause: new Error("'logprobs' must be 'true' when 'top_logprobs' is specified"),
      });
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
        if (!configToolChoice.choices.includes(toolChoice)) {
          if (tools.map((tool) => tool.definition.schema.name).includes(toolChoice)) {
            transformedConfig.tool_choice = { type: "function", function: { name: toolChoice } };
          } else {
            throw new InvalidConfigError({
              info: `Invalid config for model : '${this.modelName}'`,
              cause: new Error(`toolChoice : '${toolChoice}' is not part of provided 'tools' names or 
                one of [${configToolChoice.choices.join(", ")}]`),
            });
          }
        }
      }
    }

    if ("response_format" in transformedConfig && transformedConfig.response_format !== undefined) {
      const responseFormat = transformedConfig.response_format as string;
      if (responseFormat === "json_schema") {
        if (!("response_schema" in transformedConfig)) {
          throw new InvalidConfigError({
            info: `Invalid config for model : '${this.modelName}'`,
            cause: new Error("'responseSchema' is required in config when 'responseFormat' is 'json_schema'"),
          });
        } else {
          transformedConfig.response_format = {
            type: "json_schema",
            json_schema: transformedConfig.response_schema,
          };
          delete transformedConfig.response_schema;
        }
      } else {
        transformedConfig.response_format = { type: responseFormat };
      }
    }

    return transformedConfig;
  }

  transformMessages(messages: MessageType[]): ParamsType {
    if (!messages || (messages && messages.length === 0)) {
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
          const textContent: { type: "text"; text: string }[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              textContent.push({ type: "text", text: content.value });
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
          const textContent: { type: "text"; text: string }[] = [];
          const toolCalls: { id: string; type: "function"; function: { name: string; arguments: string } }[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              textContent.push({ type: "text", text: content.value });
            } else if (content.modality === ToolCallModalityLiteral) {
              toolCalls.push({
                id: content.id,
                type: "function",
                function: { name: content.name, arguments: content.arguments },
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
            ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
          };
        }

        case UserRoleLiteral: {
          const textContent: { type: "text"; text: string }[] = [];
          const imageContent: { type: "image_url"; image_url: { url: string; detail: string } }[] = [];
          message.content.forEach((content) => {
            if (content.modality === TextModalityLiteral) {
              textContent.push({ type: "text", text: content.value });
            } else if (content.modality === ImageModalityLiteral) {
              imageContent.push({
                type: "image_url",
                image_url: {
                  url: content.value.type === "url" ? content.value.url : content.value.base64,
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

          const combinedContent = [...textContent, ...imageContent];

          return {
            role: this.modelSchema.roles[message.role],
            content: combinedContent,
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
      type: "function",
      function: tool.definition.schema,
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
    return new Promise((resolve) => {
      resolve(this.getDefaultHeaders());
    });
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
    const safe = OpenAICompleteChatResponse.safeParse(response);
    if (safe.success) {
      if (safe.data.choices.length === 0) {
        throw new ModelResponseError({
          info: "Invalid response from model",
          cause: new Error(`No choices in response : ${JSON.stringify(safe.data)}`),
        });
      }

      const parsedResponse: OpenAICompleteChatResponseType = safe.data;
      const messages: MessageType[] = [];
      const message = parsedResponse.choices[0].message;
      if (message.content) {
        messages.push(createTextMessage(AssistantRoleLiteral, message.content));
      }

      if (message.refusal) {
        messages.push(createTextMessage(AssistantRoleLiteral, message.refusal));
      }

      if (message.tool_calls) {
        message.tool_calls.forEach((toolCall, index) => {
          messages.push(
            createToolCallMessage(AssistantRoleLiteral, index, toolCall.id, toolCall.function.name, toolCall.function.arguments)
          );
        });
      }

      const usage: ChatUsageType = {
        promptTokens: parsedResponse.usage.prompt_tokens,
        completionTokens: parsedResponse.usage.completion_tokens,
        totalTokens: parsedResponse.usage.total_tokens,
      };

      const logProbs: ChatLogProbsType = [];
      const _logProbs = parsedResponse.choices[0].logprobs;
      if (_logProbs) {
        if (_logProbs.content) {
          logProbs.push(
            ..._logProbs.content.map((logProb) => ({
              token: logProb.token,
              logProb: logProb.logprob,
              bytes: logProb.bytes,
              topLogProbs: logProb.top_logprobs.map((topLogProb) => ({
                token: topLogProb.token,
                logProb: topLogProb.logprob,
                bytes: topLogProb.bytes,
              })),
            }))
          );
        }
        if (_logProbs.refusal) {
          logProbs.push(
            ..._logProbs.refusal.map((logProb) => ({
              token: logProb.token,
              logProb: logProb.logprob,
              bytes: logProb.bytes,
              topLogProbs: logProb.top_logprobs.map((topLogProb) => ({
                token: topLogProb.token,
                logProb: topLogProb.logprob,
                bytes: topLogProb.bytes,
              })),
            }))
          );
        }
      }

      return {
        messages: messages,
        usage: usage,
        logProbs: logProbs,
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
  async getStreamChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    return new Promise((resolve) => {
      resolve(this.getDefaultHeaders());
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

    return new Promise((resolve) => {
      resolve({
        stream: true,
        stream_options: { include_usage: true },
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
      if (line === "data: [DONE]") {
        // end of stream
        return;
      } else if (line.startsWith("data: {") && line.endsWith("}")) {
        // line contains message
        let structuredLine: any;
        try {
          // remove the 'data :' prefix from string JSON
          structuredLine = JSON.parse(line.substring("data: ".length));
        } catch (error) {
          // malformed JSON error
          throw new ModelResponseError({
            info: `Malformed JSON received in stream : ${structuredLine}`,
            cause: error,
          });
        }

        const safe = OpenAIStreamChatResponse.safeParse(structuredLine);
        if (safe.success) {
          const partialResponse: PartialChatResponseType = { partialMessages: [] };
          const parsedResponse: OpenAIStreamChatResponseType = safe.data;
          if (parsedResponse.choices.length > 0) {
            const message = parsedResponse.choices[0].delta;
            if (message !== undefined && Object.keys(message).length !== 0) {
              if ("content" in message && message.content !== null) {
                partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, message.content as string));
              } else if ("refusal" in message && message.refusal !== null) {
                partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, message.refusal as string));
              } else if ("tool_calls" in message && message.tool_calls !== undefined) {
                const toolCall = message.tool_calls.at(0)!;
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

          yield { partialResponse: partialResponse, buffer: buffer };
        } else {
          throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
        }
      } else {
        // line starts with unknown event -- ignore
      }
    }
  }
}

export { BaseChatModel, BaseChatModelOptions, type BaseChatModelOptionsType };

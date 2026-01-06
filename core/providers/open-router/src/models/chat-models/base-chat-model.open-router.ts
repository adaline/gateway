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
  ChatModelPriceType,
  ChatResponseType,
  ChatUsageType,
  Config,
  ConfigType,
  ContentType,
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
  ToolCallContentType,
  ToolCallModalityLiteral,
  ToolResponseContentType,
  ToolResponseModalityLiteral,
  ToolRoleLiteral,
  ToolType,
  UrlImageContentTypeLiteral,
  UserRoleLiteral,
} from "@adaline/types";

import { OpenRouter } from "../../provider/provider.open-router";
import pricingData from "../pricing.json";
import {
  OpenRouterChatRequest,
  OpenRouterChatRequestImageContentType,
  OpenRouterChatRequestTextContentType,
  OpenRouterChatRequestToolType,
  OpenRouterChatRequestType,
  OpenRouterCompleteChatResponse,
  OpenRouterCompleteChatResponseType,
  OpenRouterStreamChatResponse,
  OpenRouterStreamChatResponseType,
} from "./types";

const BaseChatModelOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
  openRouterReferer: z.string().optional(),
  openRouterTitle: z.string().optional(),
});
type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

class BaseChatModel implements ChatModelV1<ChatModelSchemaType> {
  readonly version = "v1" as const;
  modelSchema: ChatModelSchemaType;

  private readonly modelName: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly streamChatUrl: string;
  private readonly completeChatUrl: string;
  private readonly openRouterReferer: string | undefined;
  private readonly openRouterTitle: string | undefined;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.apiKey = parsedOptions.apiKey;
    this.baseUrl = urlWithoutTrailingSlash(OpenRouter.baseUrl);
    this.streamChatUrl = urlWithoutTrailingSlash(`${this.baseUrl}/chat/completions`);
    this.completeChatUrl = urlWithoutTrailingSlash(`${this.baseUrl}/chat/completions`);
    this.openRouterReferer = parsedOptions.openRouterReferer;
    this.openRouterTitle = parsedOptions.openRouterTitle;
  }

  getDefaultBaseUrl(): UrlType {
    return this.baseUrl;
  }

  getDefaultHeaders(): HeadersType {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...(this.openRouterReferer ? { "HTTP-Referer": this.openRouterReferer } : {}),
      ...(this.openRouterTitle ? { "X-Title": this.openRouterTitle } : {}),
    };
  }

  getDefaultParams(): ParamsType {
    return {
      model: this.modelName,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number } {
    return { shouldRetry: true, delayMs: 0 };
  }

  getTokenCount(messages: MessageType[]): number {
    return messages.reduce((acc, message) => {
      return acc + message.content.map((content) => (content.modality === "text" ? content.value : "")).join(" ").length;
    }, 0);
  }

  transformModelRequest(request: OpenRouterChatRequestType): {
    modelName: string | undefined;
    config: ConfigType;
    messages: MessageType[];
    tools: ToolType[] | undefined;
  } {
    const safeRequest = OpenRouterChatRequest.safeParse(request);
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
    _config.topA = parsedRequest.top_a;
    _config.topP = parsedRequest.top_p;
    _config.minP = parsedRequest.min_p;
    _config.topK = parsedRequest.top_k;
    _config.repetitionPenalty = parsedRequest.repetition_penalty;
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
            const content = message.content as string | OpenRouterChatRequestTextContentType[];
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
            const content = message.content as string | (OpenRouterChatRequestTextContentType | OpenRouterChatRequestImageContentType)[];
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
                        mediaType: getMimeTypeFromBase64(c.image_url.url) as Base64ImageContentValueType["mediaType"],
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
              const content = message.content as string | OpenRouterChatRequestTextContentType[];
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
      parsedRequest.tools.forEach((tool: OpenRouterChatRequestToolType) => {
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

    // Filter out error and search-result modalities from all messages (these are output-only modalities)
    parsedMessages.forEach((message) => {
      message.content = message.content.filter(
        (content) => content.modality !== "error" && content.modality !== "search-result"
      );
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
            ...(textContent.length > 0 ? { content: textContent } : {}),
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
    const safe = OpenRouterCompleteChatResponse.safeParse(response);
    if (safe.success) {
      if (safe.data.choices.length === 0) {
        throw new ModelResponseError({
          info: "Invalid response from model",
          cause: new Error(`No choices in response : ${JSON.stringify(safe.data)}`),
        });
      }

      const parsedResponse: OpenRouterCompleteChatResponseType = safe.data;
      const messages: MessageType[] = [
        {
          role: AssistantRoleLiteral,
          content: [],
        },
      ];
      const message = parsedResponse.choices[0].message;
      if (message.content) {
        messages[0].content.push(createTextContent(message.content));
      }

      if (message.refusal) {
        messages[0].content.push(createTextContent(message.refusal));
      }

      if (message.tool_calls) {
        message.tool_calls.forEach((toolCall, index) => {
          messages[0].content.push(createToolCallContent(index, toolCall.id, toolCall.function.name, toolCall.function.arguments));
        });
      }

      let usage: ChatUsageType | undefined;
      if (parsedResponse.usage) {
        usage = {
          promptTokens: parsedResponse.usage.prompt_tokens,
          completionTokens: parsedResponse.usage.completion_tokens,
          totalTokens: parsedResponse.usage.total_tokens,
        };
      }

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

      if (line.startsWith("data: ")) {
        const jsonStr = line.substring("data: ".length);
        try {
          const structuredLine = JSON.parse(jsonStr);
          const safe = OpenRouterStreamChatResponse.safeParse(structuredLine);
          if (safe.success) {
            const partialResponse: PartialChatResponseType = { partialMessages: [] };
            const parsedResponse: OpenRouterStreamChatResponseType = safe.data;
            // Process message content
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

  getModelPricing(): ChatModelPriceType {
    // Check if the modelName exists in pricingData before accessing it
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

export { BaseChatModel, BaseChatModelOptions, type BaseChatModelOptionsType };

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
  createPartialReasoningMessage,
  createPartialResponseErrorMessage,
  createPartialSearchResultMessage,
  createPartialTextMessage,
  createPartialToolCallMessage,
  createReasoningContent,
  createResponseErrorContent,
  createSearchResultContent,
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

import pricingData from "../pricing.json";
import { OpenAI } from "./../../provider/provider.openai";
import {
  OpenAIChatRequest,
  OpenAIChatRequestImageContentType,
  OpenAIChatRequestTextContentType,
  OpenAIChatRequestToolType,
  OpenAIChatRequestType,
  OpenAICompleteChatResponse,
  OpenAICompleteChatResponseType,
  OpenAIResponsesCompleteResponse,
  OpenAIStreamChatResponse,
  OpenAIStreamChatResponseType,
} from "./types";

const BaseChatModelOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().url().optional(),
  completeChatUrl: z.string().url().optional(),
  streamChatUrl: z.string().url().optional(),
  organization: z.string().optional(),
  forceResponsesApi: z.boolean().optional(),
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
  private readonly forceResponsesApi: boolean;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.apiKey = parsedOptions.apiKey;
    this.baseUrl = urlWithoutTrailingSlash(parsedOptions.baseUrl || OpenAI.baseUrl);
    this.streamChatUrl = urlWithoutTrailingSlash(parsedOptions.streamChatUrl || `${this.baseUrl}/chat/completions`);
    this.completeChatUrl = urlWithoutTrailingSlash(parsedOptions.completeChatUrl || `${this.baseUrl}/chat/completions`);
    this.organization = parsedOptions.organization;
    this.forceResponsesApi = parsedOptions.forceResponsesApi ?? false;
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
  getRetryDelay(responseHeaders: HeadersType, _responseData: unknown): { shouldRetry: boolean; delayMs: number } {
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

  private shouldUseResponsesApi(config: ConfigType, _tools?: ToolType[]): boolean {
    return this.forceResponsesApi || (config as { webSearchTool?: unknown }).webSearchTool === true;
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
    _config.maxTokens = parsedRequest.max_completion_tokens;
    _config.temperature = parsedRequest.temperature;
    _config.topP = parsedRequest.top_p;
    _config.presencePenalty = parsedRequest.presence_penalty;
    _config.frequencyPenalty = parsedRequest.frequency_penalty;
    _config.stop = parsedRequest.stop;
    _config.logProbs = parsedRequest.logprobs;
    _config.topLogProbs = parsedRequest.top_logprobs;
    _config.reasoningEffort = parsedRequest.reasoning_effort;
    _config.verbosity = parsedRequest.verbosity;

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

      if (paramKey === "max_completion_tokens" && def.type === "range" && paramValue === 0) {
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

    // Handle web_search_options construction — only include when explicitly enabled
    if ("webSearch" in transformedConfig && transformedConfig.webSearch === true) {
      transformedConfig.web_search_options = {};
    }
    // Always clean up internal web search keys to prevent leaking to API
    delete transformedConfig.webSearch;
    // These three keys are Responses-API-only; never emit to Chat Completions body.
    delete transformedConfig.webSearchAllowedDomains;
    delete transformedConfig.webSearchUserLocation;
    delete transformedConfig.webSearchExternalAccess;

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
      message.content = message.content.filter((content) => content.modality !== "error" && content.modality !== "search-result");
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
    if (this.shouldUseResponsesApi(config ?? {})) {
      return Promise.resolve(`${this.baseUrl}/responses`);
    }
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
    if (this.shouldUseResponsesApi(config, tools)) {
      return this.getCompleteChatDataResponsesApi(config, messages, tools);
    }
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

  transformCompleteChatResponse(response: unknown): ChatResponseType {
    if (response && typeof response === "object" && (response as { object?: unknown }).object === "response") {
      return this.transformCompleteChatResponseResponsesApi(response);
    }
    const safe = OpenAICompleteChatResponse.safeParse(response);
    if (safe.success) {
      if (safe.data.choices.length === 0) {
        throw new ModelResponseError({
          info: "Invalid response from model",
          cause: new Error(`No choices in response : ${JSON.stringify(safe.data)}`),
        });
      }

      const parsedResponse: OpenAICompleteChatResponseType = safe.data;
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

      if (message.content && message.annotations && message.annotations.length > 0) {
        const annotations = message.annotations.map((annotation) => ({
          url: annotation.url_citation.url,
          title: annotation.url_citation.title,
          start_index: annotation.url_citation.start_index,
          end_index: annotation.url_citation.end_index,
        }));
        messages[0].content.push(this.buildSearchResultContent(message.content, annotations));
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
    if (this.shouldUseResponsesApi(config ?? {})) {
      return Promise.resolve(`${this.baseUrl}/responses`);
    }
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
    if (this.shouldUseResponsesApi(config, tools)) {
      return this.getStreamChatDataResponsesApi(config, messages, tools);
    }
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

  // Dispatch between CC and Responses stream parsers is based on two signals (in priority):
  //   1. Buffer sidecar marker (__RESP_STATE__): once a call starts parsing Responses events,
  //      subsequent chunks carry the marker and stay on the Responses path.
  //   2. First parseable line's identity field: `object === "chat.completion.chunk"` routes to CC;
  //      `type` starting with "response." or equal to "error" routes to Responses.
  // A caller who mixes CC and Responses chunks in the same generator lifecycle is unsupported;
  // the sidecar state cannot be recovered if the first chunk was CC and the second switches to Responses.
  async *transformStreamChatResponseChunk(
    chunk: string,
    buffer: string
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    // Dispatch by identity: peek at the first complete `data: ` line (including anything
    // still held in `buffer`) to decide whether to route this call to the Responses
    // parser. Responses state sidecar in `buffer` starts with the `__RESP_STATE__` marker
    // — that alone also forces the Responses path even if the chunk's first line hasn't
    // arrived yet.
    if (buffer.startsWith("__RESP_STATE__") || this.looksLikeResponsesStream(buffer + chunk)) {
      yield* this.transformStreamChatResponseChunkResponsesApi(chunk, buffer);
      return;
    }

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
          const safe = OpenAIStreamChatResponse.safeParse(structuredLine);
          if (safe.success) {
            const partialResponse: PartialChatResponseType = { partialMessages: [] };
            const parsedResponse: OpenAIStreamChatResponseType = safe.data;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected transformConfigResponsesApi(config: ConfigType, messages?: MessageType[], tools?: ToolType[]): ParamsType {
    // Q2 schema-key guard: throw early if webSearchTool is requested on a model
    // whose schema doesn't advertise the webSearchTool config key.
    if ((config as { webSearchTool?: unknown }).webSearchTool === true && !("webSearchTool" in this.modelSchema.config.def)) {
      throw new InvalidConfigError({
        info: `Invalid config for model : '${this.modelName}'`,
        cause: new Error(
          `model : '${this.modelName}' does not support the 'webSearchTool' config key — it cannot route to the Responses API web_search built-in tool`
        ),
      });
    }

    // Strip-and-reattach toolChoice so schema.safeParse doesn't reject custom function names
    // that aren't in the schema's choices list (mirrors CC transformConfig without delegating).
    const _toolChoice = config.toolChoice;
    delete config.toolChoice;

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

    // Cross-field guard: OpenAI rejects webSearchTool=true with reasoningEffort="minimal" on gpt-5 models.
    // Pre-validate here so the caller sees a typed InvalidConfigError instead of a raw HTTP 400.
    if (
      (parsedConfig as { webSearchTool?: unknown }).webSearchTool === true &&
      (parsedConfig as { reasoningEffort?: unknown }).reasoningEffort === "minimal"
    ) {
      throw new InvalidConfigError({
        info: `Invalid config combination for model: '${this.modelName}'`,
        cause: new Error(
          "webSearchTool=true is incompatible with reasoningEffort='minimal' — OpenAI Responses API rejects this combination"
        ),
      });
    }

    // CC-only params (schema `param` values) that must NOT leak onto the Responses request.
    const ccOnlyParams = new Set<string>([
      "logprobs",
      "frequency_penalty",
      "presence_penalty",
      "stop",
      "seed",
      "n",
      "stream_options",
      "web_search_options",
      "webSearch",
    ]);

    const responsesConfig: ParamsType = {};
    // Structured-output accumulator — responseFormat/responseSchema/verbosity all fold into `text`.
    const textParams: { format?: Record<string, unknown>; verbosity?: string } = {};
    let responseFormatValue: string | undefined;
    let responseSchemaValue: { name: string; description?: string; schema: unknown; strict?: boolean } | undefined;

    for (const key of Object.keys(parsedConfig)) {
      const def = this.modelSchema.config.def[key];
      const paramKey = def.param;
      const paramValue = (parsedConfig as ConfigType)[key];

      if (ccOnlyParams.has(paramKey)) {
        continue;
      }

      if (paramKey === "max_completion_tokens") {
        if (def.type === "range" && paramValue === 0) {
          responsesConfig.max_output_tokens = def.max;
        } else {
          responsesConfig.max_output_tokens = paramValue;
        }
        continue;
      }

      if (paramKey === "reasoning_effort") {
        responsesConfig.reasoning = { effort: paramValue };
        continue;
      }

      if (paramKey === "verbosity") {
        textParams.verbosity = paramValue as string;
        continue;
      }

      if (paramKey === "response_format") {
        responseFormatValue = paramValue as string;
        continue;
      }

      if (paramKey === "response_schema") {
        responseSchemaValue = paramValue as { name: string; description?: string; schema: unknown; strict?: boolean };
        continue;
      }

      if (paramKey === "tool_choice") {
        const toolChoice = paramValue as string;
        if (!tools || tools.length === 0) {
          throw new InvalidConfigError({
            info: `Invalid config for model : '${this.modelName}'`,
            cause: new Error("'tools' are required when 'toolChoice' is specified"),
          });
        }
        const configToolChoice = this.modelSchema.config.def.toolChoice as SelectStringConfigItemDefType;
        if (configToolChoice.choices.includes(toolChoice)) {
          responsesConfig.tool_choice = toolChoice;
        } else if (tools.map((tool) => tool.definition.schema.name).includes(toolChoice)) {
          responsesConfig.tool_choice = { type: "function", name: toolChoice };
        } else {
          throw new InvalidConfigError({
            info: `Invalid config for model : '${this.modelName}'`,
            cause: new Error(`toolChoice : '${toolChoice}' is not part of provided 'tools' names or
                one of [${configToolChoice.choices.join(", ")}]`),
          });
        }
        continue;
      }

      if (paramKey === "top_logprobs") {
        // Handled below after the loop, together with logprobs.
        continue;
      }

      responsesConfig[paramKey] = paramValue;
    }

    // Logprobs: Responses API uses top_logprobs only (no separate logprobs boolean).
    // Emit top_logprobs when logProbs=true; guard against top_logprobs>0 without logProbs=true.
    const _logProbs = (parsedConfig as { logProbs?: unknown }).logProbs;
    const _topLogProbs = (parsedConfig as { topLogProbs?: unknown }).topLogProbs;
    if (_logProbs === true) {
      responsesConfig.top_logprobs = typeof _topLogProbs === "number" ? _topLogProbs : 0;
    } else if (typeof _topLogProbs === "number" && _topLogProbs > 0) {
      throw new InvalidConfigError({
        info: `Invalid config for model : '${this.modelName}'`,
        cause: new Error("'logprobs' must be 'true' when 'top_logprobs' is specified"),
      });
    }

    if (responseFormatValue !== undefined) {
      if (responseFormatValue === "json_schema") {
        if (!responseSchemaValue) {
          throw new InvalidConfigError({
            info: `Invalid config for model : '${this.modelName}'`,
            cause: new Error("'responseSchema' is required in config when 'responseFormat' is 'json_schema'"),
          });
        }
        textParams.format = {
          type: "json_schema",
          name: responseSchemaValue.name,
          ...(responseSchemaValue.description !== undefined ? { description: responseSchemaValue.description } : {}),
          schema: responseSchemaValue.schema,
          ...(responseSchemaValue.strict !== undefined ? { strict: responseSchemaValue.strict } : {}),
        };
      } else {
        textParams.format = { type: responseFormatValue };
      }
    }

    if (textParams.format !== undefined || textParams.verbosity !== undefined) {
      responsesConfig.text = textParams;
    }

    return responsesConfig;
  }

  protected transformMessagesResponsesApi(messages: MessageType[]): ParamsType {
    if (!messages || messages.length === 0) {
      return { input: [] };
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

    // Filter out error and search-result modalities (output-only)
    parsedMessages.forEach((message) => {
      message.content = message.content.filter((content) => content.modality !== "error" && content.modality !== "search-result");
    });

    const instructionsParts: string[] = [];
    const input: Record<string, unknown>[] = [];

    for (const message of parsedMessages) {
      switch (message.role) {
        case SystemRoleLiteral: {
          for (const content of message.content) {
            if (content.modality === TextModalityLiteral) {
              instructionsParts.push(content.value);
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          }
          break;
        }

        case UserRoleLiteral: {
          const contentParts: Record<string, unknown>[] = [];
          for (const content of message.content) {
            if (content.modality === TextModalityLiteral) {
              contentParts.push({ type: "input_text", text: content.value });
            } else if (content.modality === ImageModalityLiteral) {
              const url = content.value.type === "url" ? content.value.url : (content.value as Base64ImageContentValueType).base64;
              contentParts.push({
                type: "input_image",
                image_url: {
                  url,
                  detail: content.detail,
                },
              });
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          }
          input.push({ type: "message", role: "user", content: contentParts });
          break;
        }

        case AssistantRoleLiteral: {
          const textParts: { type: "output_text"; text: string }[] = [];
          const toolCalls: ToolCallContentType[] = [];
          for (const content of message.content) {
            if (content.modality === TextModalityLiteral) {
              textParts.push({ type: "output_text", text: content.value });
            } else if (content.modality === ToolCallModalityLiteral) {
              toolCalls.push(content);
            } else {
              throw new InvalidMessagesError({
                info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
              });
            }
          }
          if (textParts.length > 0) {
            input.push({ type: "message", role: "assistant", content: textParts });
          }
          for (const toolCall of toolCalls) {
            input.push({
              type: "function_call",
              call_id: toolCall.id,
              name: toolCall.name,
              arguments: toolCall.arguments,
            });
          }
          break;
        }

        case ToolRoleLiteral: {
          if (message.content.length !== 1) {
            throw new InvalidMessagesError({
              info: `Invalid message for role : '${message.role}'`,
              cause: new Error(`role : '${message.role}' must have exactly one content item`),
            });
          }
          const content = message.content[0];
          if (content.modality !== ToolResponseModalityLiteral) {
            throw new InvalidMessagesError({
              info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
              cause: new Error(`role : '${message.role}' must have content with modality : '${ToolResponseModalityLiteral}'`),
            });
          }
          const toolResponse = content as ToolResponseContentType;
          input.push({
            type: "function_call_output",
            call_id: toolResponse.id,
            output: toolResponse.data,
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
    }

    const result: ParamsType = { input };
    if (instructionsParts.length > 0) {
      result.instructions = instructionsParts.join("\n\n");
    }
    return result;
  }

  protected transformToolsResponsesApi(config: ConfigType, tools?: ToolType[]): ParamsType {
    const responsesTools: Record<string, unknown>[] = [];

    if (tools && tools.length > 0) {
      if (!this.modelSchema.modalities.includes(ToolCallModalityLiteral)) {
        throw new InvalidToolsError({
          info: `Invalid tool 'modality' for model : ${this.modelName}`,
          cause: new Error(`model : '${this.modelName}' does not support tool modality : '${ToolCallModalityLiteral}'`),
        });
      }

      const parsedTools = tools.map((tool) => {
        const parsedTool = Tool().safeParse(tool);
        if (!parsedTool.success) {
          throw new InvalidToolsError({ info: "Invalid tools", cause: parsedTool.error });
        }
        return parsedTool.data;
      });

      for (const tool of parsedTools) {
        const schema = tool.definition.schema;
        responsesTools.push({
          type: "function",
          name: schema.name,
          ...(schema.description !== undefined ? { description: schema.description } : {}),
          parameters: schema.parameters,
          ...(schema.strict !== undefined ? { strict: schema.strict } : {}),
        });
      }
    }

    if ((config as { webSearchTool?: unknown }).webSearchTool === true) {
      const webSearchTool: Record<string, unknown> = { type: "web_search" };

      const domains = (config as { webSearchAllowedDomains?: string[] }).webSearchAllowedDomains;
      if (Array.isArray(domains) && domains.length > 0) {
        webSearchTool.filters = { allowed_domains: domains };
      }

      const loc = (
        config as {
          webSearchUserLocation?: { country?: string; city?: string; region?: string; timezone?: string };
        }
      ).webSearchUserLocation;
      if (loc && (loc.country || loc.city || loc.region || loc.timezone)) {
        webSearchTool.user_location = {
          type: "approximate",
          ...(loc.country ? { country: loc.country } : {}),
          ...(loc.city ? { city: loc.city } : {}),
          ...(loc.region ? { region: loc.region } : {}),
          ...(loc.timezone ? { timezone: loc.timezone } : {}),
        };
      }

      const externalAccess = (config as { webSearchExternalAccess?: boolean }).webSearchExternalAccess;
      if (externalAccess === false) {
        webSearchTool.external_web_access = false;
      }

      responsesTools.push(webSearchTool);
    }

    if (responsesTools.length === 0) {
      return {};
    }
    return { tools: responsesTools };
  }

  protected getCompleteChatDataResponsesApi(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType> {
    const transformedConfig = this.transformConfigResponsesApi(config, messages, tools);
    const transformedMessages = this.transformMessagesResponsesApi(messages) as { instructions?: string; input: unknown[] };
    if (!transformedMessages.input || transformedMessages.input.length === 0) {
      throw new InvalidMessagesError({
        info: "Messages are required",
        cause: new Error("Messages are required"),
      });
    }
    const transformedTools = this.transformToolsResponsesApi(config, tools);

    return Promise.resolve({
      ...this.getDefaultParams(),
      ...(transformedMessages.instructions ? { instructions: transformedMessages.instructions } : {}),
      ...transformedConfig,
      ...transformedTools,
      input: transformedMessages.input,
    });
  }

  protected getStreamChatDataResponsesApi(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType> {
    const transformedConfig = this.transformConfigResponsesApi(config, messages, tools);
    const transformedMessages = this.transformMessagesResponsesApi(messages) as { instructions?: string; input: unknown[] };
    if (!transformedMessages.input || transformedMessages.input.length === 0) {
      throw new InvalidMessagesError({
        info: "Messages are required",
        cause: new Error("Messages are required"),
      });
    }
    const transformedTools = this.transformToolsResponsesApi(config, tools);

    return Promise.resolve({
      stream: true,
      ...this.getDefaultParams(),
      ...(transformedMessages.instructions ? { instructions: transformedMessages.instructions } : {}),
      ...transformedConfig,
      ...transformedTools,
      input: transformedMessages.input,
    });
  }

  protected transformCompleteChatResponseResponsesApi(response: unknown): ChatResponseType {
    const safe = OpenAIResponsesCompleteResponse.safeParse(response);
    if (!safe.success) {
      throw new ModelResponseError({
        info: "Invalid response from model",
        cause: safe.error,
      });
    }
    const parsed = safe.data;

    // Compute any surfaceable error from status/error fields. Non-terminal statuses ("failed"
    // with output, "incomplete", "cancelled") produce an ErrorContent appended after parsing
    // so callers still receive any partial text. Terminal "failed" with no output throws.
    let responseError: { code: string; message: string } | null = null;
    if (parsed.status === "failed") {
      if (parsed.error) {
        responseError = {
          code: parsed.error.code ?? parsed.error.type ?? "failed",
          message: parsed.error.message,
        };
      } else {
        responseError = {
          code: "failed",
          message: `Response failed for model: '${this.modelName}'`,
        };
      }
    } else if (parsed.status === "incomplete") {
      responseError = {
        code: "incomplete",
        message: `Response incomplete — reason: ${parsed.incomplete_details?.reason ?? "unknown"}`,
      };
    } else if (parsed.status === "cancelled") {
      responseError = {
        code: "cancelled",
        message: `Response cancelled for model: '${this.modelName}'`,
      };
    } else if (parsed.error) {
      // Edge case: status=completed but error field populated.
      responseError = {
        code: parsed.error.code ?? parsed.error.type ?? "error",
        message: parsed.error.message,
      };
    }

    const hasNoOutput = !parsed.output || parsed.output.length === 0;
    if (responseError !== null && hasNoOutput && (parsed.status === "failed" || parsed.error)) {
      throw new ModelResponseError({
        info: `Responses API returned status '${parsed.status}' for model: '${this.modelName}'`,
        cause: new Error(responseError.message),
      });
    }

    const messages: MessageType[] = [{ role: AssistantRoleLiteral, content: [] }];
    const collectedAnnotations: { url: string; title: string; start_index: number; end_index: number }[] = [];
    const searchQueries: string[] = [];
    let collectedText = "";
    let functionCallIndex = 0;
    let hadWebSearchCall = false;

    for (const item of parsed.output) {
      if (item.type === "message") {
        for (const part of item.content) {
          if (part.type === "output_text") {
            messages[0].content.push(createTextContent(part.text));
            collectedText += part.text;
            for (const annotation of part.annotations ?? []) {
              if (annotation.type === "url_citation") {
                collectedAnnotations.push({
                  url: annotation.url,
                  title: annotation.title,
                  start_index: annotation.start_index,
                  end_index: annotation.end_index,
                });
              }
              // file_citation, file_path, container_file_citation are ignored — file_search and code_interpreter tools are out of scope (Q6)
            }
          } else if (part.type === "refusal") {
            messages[0].content.push(createResponseErrorContent("refusal", part.refusal, "openai"));
          }
        }
      } else if (item.type === "function_call") {
        messages[0].content.push(createToolCallContent(functionCallIndex++, item.call_id, item.name, item.arguments));
      } else if (item.type === "reasoning") {
        const summaryParts = item.summary ?? [];
        const thinking = summaryParts
          .filter((p) => p.type === "summary_text" && typeof p.text === "string")
          .map((p) => p.text)
          .join("\n\n");
        const signature = item.encrypted_content ?? "";
        if (thinking || signature) {
          messages[0].content.push(createReasoningContent(thinking, signature));
        }
      } else if (item.type === "web_search_call") {
        hadWebSearchCall = true;
        if (item.action?.query) {
          searchQueries.push(item.action.query);
        }
      }
      // file_search_call items emit no content (Q5 out-of-scope)
    }

    const joinedQuery = searchQueries.join(" | ");
    if (collectedAnnotations.length > 0 || (hadWebSearchCall && joinedQuery.length > 0)) {
      messages[0].content.push(this.buildSearchResultContent(collectedText, collectedAnnotations, joinedQuery));
    }

    if (responseError !== null) {
      messages[0].content.push(createResponseErrorContent(responseError.code, responseError.message, "openai"));
    }

    const usage: ChatUsageType = {
      promptTokens: parsed.usage?.input_tokens ?? 0,
      completionTokens: parsed.usage?.output_tokens ?? 0,
      totalTokens: parsed.usage?.total_tokens ?? 0,
    };

    const logProbs: ChatLogProbsType = [];
    for (const item of parsed.output) {
      if (item.type === "message") {
        for (const part of item.content) {
          if (part.type === "output_text" && part.logprobs) {
            for (const lp of part.logprobs) {
              logProbs.push({
                token: lp.token,
                logProb: lp.logprob,
                bytes: lp.bytes,
                topLogProbs: lp.top_logprobs.map((top) => ({
                  token: top.token,
                  logProb: top.logprob,
                  bytes: top.bytes,
                })),
              });
            }
          }
        }
      }
    }

    return { messages, usage, logProbs };
  }

  private looksLikeResponsesStream(data: string): boolean {
    // Peek at the first `data: ` line in `data` (buffer + chunk). If it parses as an object
    // whose `type` starts with `response.` or equals `"error"` — and whose `object` is NOT
    // `"chat.completion.chunk"` — it's a Responses-API event stream.
    let idx = 0;
    while (idx < data.length) {
      const nlIdx = data.indexOf("\n", idx);
      if (nlIdx === -1) {
        return false;
      }
      const line = data.substring(idx, nlIdx).trim();
      idx = nlIdx + 1;
      if (!line || !line.startsWith("data: ")) {
        continue;
      }
      const payload = line.substring("data: ".length);
      if (payload === "[DONE]") {
        return false;
      }
      try {
        const parsed = JSON.parse(payload) as { object?: unknown; type?: unknown };
        if (parsed && typeof parsed === "object") {
          if (parsed.object === "chat.completion.chunk") {
            return false;
          }
          if (typeof parsed.type === "string" && (parsed.type.startsWith("response.") || parsed.type === "error")) {
            return true;
          }
        }
      } catch {
        return false;
      }
      return false;
    }
    return false;
  }

  private extractStreamState(buffer: string): {
    state: { itemIdToIndex: Record<string, number>; nextIndex: number };
    rest: string;
  } {
    const marker = "__RESP_STATE__";
    if (!buffer.startsWith(marker)) {
      return { state: { itemIdToIndex: {}, nextIndex: 0 }, rest: buffer };
    }
    const newlineIdx = buffer.indexOf("\n", marker.length);
    const stateJson = newlineIdx === -1 ? buffer.slice(marker.length) : buffer.slice(marker.length, newlineIdx);
    const rest = newlineIdx === -1 ? "" : buffer.slice(newlineIdx + 1);
    try {
      const parsed = JSON.parse(stateJson) as { itemIdToIndex?: Record<string, number>; nextIndex?: number };
      return {
        state: {
          itemIdToIndex: parsed.itemIdToIndex ?? {},
          nextIndex: parsed.nextIndex ?? 0,
        },
        rest,
      };
    } catch {
      return { state: { itemIdToIndex: {}, nextIndex: 0 }, rest };
    }
  }

  private serializeStreamState(state: { itemIdToIndex: Record<string, number>; nextIndex: number }, rest: string): string {
    return `__RESP_STATE__${JSON.stringify(state)}\n${rest}`;
  }

  protected async *transformStreamChatResponseChunkResponsesApi(
    chunk: string,
    buffer: string
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    const { state, rest } = this.extractStreamState(buffer);
    const data = rest + chunk;

    const lines: string[] = [];
    let newBufferTail = "";
    let currentIndex = 0;
    while (currentIndex < data.length) {
      const newlineIndex = data.indexOf("\n", currentIndex);
      if (newlineIndex === -1) {
        newBufferTail = data.substring(currentIndex);
        break;
      }
      const line = data.substring(currentIndex, newlineIndex).trim();
      if (line) {
        lines.push(line);
      }
      currentIndex = newlineIndex + 1;
    }

    for (const line of lines) {
      if (line === "data: [DONE]") {
        return;
      }
      if (!line.startsWith("data: ")) {
        continue;
      }
      const jsonStr = line.substring("data: ".length);
      let event: unknown;
      try {
        event = JSON.parse(jsonStr);
      } catch (e) {
        throw new ModelResponseError({
          info: `Malformed JSON received in stream: ${jsonStr}`,
          cause: e instanceof Error ? e : new Error(String(e)),
        });
      }
      if (typeof event !== "object" || event === null) {
        continue;
      }

      const evt = event as { type?: string; [k: string]: unknown };
      const type = evt.type ?? "";
      const partialResponse: PartialChatResponseType = { partialMessages: [] };

      if (type === "response.created" || type === "response.in_progress" || type === "response.queued") {
        continue;
      }

      if (type === "response.output_text.delta") {
        const delta = (evt as { delta?: unknown }).delta;
        if (typeof delta === "string" && delta.length > 0) {
          partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, delta));
        }
      } else if (type === "response.output_text.annotation.added") {
        const annotation = (
          evt as {
            annotation?: { type?: string; url?: string; title?: string; start_index?: number; end_index?: number };
          }
        ).annotation;
        if (annotation && annotation.type === "url_citation" && annotation.url) {
          partialResponse.partialMessages.push(
            createPartialSearchResultMessage(
              AssistantRoleLiteral,
              "openai",
              "",
              [{ source: "web", url: annotation.url, title: annotation.title ?? "" }],
              [
                {
                  text: "",
                  responseIndices: [0],
                  startIndex: annotation.start_index ?? 0,
                  endIndex: annotation.end_index ?? 0,
                },
              ]
            )
          );
        }
      } else if (type === "response.output_text.done") {
        continue;
      } else if (type === "response.refusal.delta") {
        const delta = (evt as { delta?: unknown }).delta;
        if (typeof delta === "string" && delta.length > 0) {
          partialResponse.partialMessages.push(createPartialResponseErrorMessage(AssistantRoleLiteral, "refusal", delta, "openai"));
        }
      } else if (type === "response.refusal.done") {
        continue;
      } else if (type === "response.reasoning_summary_text.delta" || type === "response.reasoning_text.delta") {
        const delta = (evt as { delta?: unknown }).delta;
        if (typeof delta === "string" && delta.length > 0) {
          partialResponse.partialMessages.push(createPartialReasoningMessage(AssistantRoleLiteral, delta, ""));
        }
      } else if (
        type === "response.reasoning_summary_text.done" ||
        type === "response.reasoning_text.done" ||
        type === "response.reasoning_summary_part.added" ||
        type === "response.reasoning_summary_part.done"
      ) {
        continue;
      } else if (type === "response.output_item.added") {
        const item = (
          evt as {
            item?: { id?: string; type?: string; call_id?: string; name?: string; action?: { query?: string } };
          }
        ).item;
        if (item && item.type === "function_call" && item.id) {
          if (!(item.id in state.itemIdToIndex)) {
            state.itemIdToIndex[item.id] = state.nextIndex++;
          }
          if (item.name !== undefined) {
            partialResponse.partialMessages.push(
              createPartialToolCallMessage(AssistantRoleLiteral, state.itemIdToIndex[item.id], item.call_id ?? "", item.name, "")
            );
          }
        } else if (item && item.type === "web_search_call" && item.action?.query) {
          partialResponse.partialMessages.push(createPartialSearchResultMessage(AssistantRoleLiteral, "openai", item.action.query, [], []));
        }
      } else if (type === "response.function_call_arguments.delta") {
        const itemId = (evt as { item_id?: string }).item_id;
        const delta = (evt as { delta?: unknown }).delta;
        if (itemId && typeof delta === "string") {
          if (!(itemId in state.itemIdToIndex)) {
            state.itemIdToIndex[itemId] = state.nextIndex++;
          }
          const idx = state.itemIdToIndex[itemId];
          partialResponse.partialMessages.push(createPartialToolCallMessage(AssistantRoleLiteral, idx, undefined, undefined, delta));
        }
      } else if (type === "response.function_call_arguments.done") {
        continue;
      } else if (
        type === "response.web_search_call.in_progress" ||
        type === "response.web_search_call.searching" ||
        type === "response.web_search_call.completed"
      ) {
        continue;
      } else if (
        type === "response.file_search_call.in_progress" ||
        type === "response.file_search_call.searching" ||
        type === "response.file_search_call.completed"
      ) {
        continue;
      } else if (type === "response.content_part.added" || type === "response.content_part.done") {
        continue;
      } else if (type === "response.output_item.done") {
        continue;
      } else if (type === "response.completed") {
        const resp = (
          evt as {
            response?: { usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number } };
          }
        ).response;
        if (resp?.usage) {
          partialResponse.usage = {
            promptTokens: resp.usage.input_tokens ?? 0,
            completionTokens: resp.usage.output_tokens ?? 0,
            totalTokens: resp.usage.total_tokens ?? 0,
          };
        }
      } else if (type === "response.failed" || type === "response.incomplete") {
        const resp = (
          evt as {
            response?: {
              error?: { message?: string };
              incomplete_details?: { reason?: string };
              usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
            };
          }
        ).response;
        const code = type === "response.failed" ? "failed" : "incomplete";
        const reason = resp?.error?.message ?? resp?.incomplete_details?.reason ?? "no details";
        partialResponse.partialMessages.push(createPartialResponseErrorMessage(AssistantRoleLiteral, code, reason, "openai"));
        if (resp?.usage) {
          partialResponse.usage = {
            promptTokens: resp.usage.input_tokens ?? 0,
            completionTokens: resp.usage.output_tokens ?? 0,
            totalTokens: resp.usage.total_tokens ?? 0,
          };
        }
      } else if (type === "error") {
        const errorPayload = (
          evt as {
            error?: { message?: string; type?: string; code?: string | null; param?: string | null };
          }
        ).error;
        throw new ModelResponseError({
          info: `Responses API stream error: ${errorPayload?.message ?? "unknown"}`,
          cause: new Error(JSON.stringify(errorPayload ?? {})),
        });
      } else {
        continue;
      }

      if (partialResponse.partialMessages.length > 0 || partialResponse.usage) {
        yield { partialResponse, buffer: this.serializeStreamState(state, newBufferTail) };
      }
    }

    yield { partialResponse: { partialMessages: [] }, buffer: this.serializeStreamState(state, newBufferTail) };
  }

  protected buildSearchResultContent(
    text: string,
    annotations: ReadonlyArray<{ url: string; title: string; start_index: number; end_index: number }>,
    query = ""
  ): ContentType {
    const urlMap = new Map<string, number>();
    const responses: { source: string; url: string; title: string }[] = [];
    const references: { text: string; responseIndices: number[]; startIndex?: number; endIndex?: number }[] = [];

    for (const citation of annotations) {
      if (!urlMap.has(citation.url)) {
        urlMap.set(citation.url, responses.length);
        responses.push({
          source: "web",
          url: citation.url,
          title: citation.title,
        });
      }
      const prefixChars = 40;
      const prefixStart = Math.max(0, citation.start_index - prefixChars);
      const citationText = (prefixStart > 0 ? "..." : "") + text.slice(prefixStart, citation.end_index);

      references.push({
        text: citationText,
        responseIndices: [urlMap.get(citation.url)!],
        startIndex: citation.start_index,
        endIndex: citation.end_index,
      });
    }

    return createSearchResultContent("openai", query, responses, references);
  }
}

export { BaseChatModel, BaseChatModelOptions, type BaseChatModelOptionsType };

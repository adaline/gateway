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
  ImageContentType,
  ImageModalityLiteral,
  Message,
  MessageType,
  PartialChatResponseType,
  ResponseSchemaType,
  SystemRoleLiteral,
  TextModalityLiteral,
  Tool,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ToolRoleLiteral,
  ToolType,
  UserRoleLiteral,
} from "@adaline/types";

import { Google } from "../../provider/provider.google";
import pricingData from "../pricing.json";
import {
  GoogleChatContentPartFunctionCallType,
  GoogleChatContentPartFunctionResponseType,
  GoogleChatContentPartInlineDataType,
  GoogleChatContentPartTextType,
  GoogleChatContentType,
  GoogleChatRequest,
  GoogleChatRequestType,
  GoogleChatSystemInstructionType,
  GoogleChatToolType,
  GoogleCompleteChatResponse,
  GoogleCompleteChatResponseType,
  GoogleStreamChatResponse,
  GoogleStreamChatResponseType,
} from "./types";

const BaseChatModelOptions = z.object({
  modelName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().url().optional(),
  completeChatUrl: z.string().url().optional(),
  streamChatUrl: z.string().url().optional(),
});
type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

class BaseChatModel implements ChatModelV1<ChatModelSchemaType> {
  readonly version = "v1" as const;
  modelSchema: ChatModelSchemaType;
  readonly modelName: string;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly streamChatUrl: string;
  private readonly completeChatUrl: string;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.apiKey = parsedOptions.apiKey;
    this.baseUrl = urlWithoutTrailingSlash(parsedOptions.baseUrl ?? Google.baseUrl);
    this.completeChatUrl = urlWithoutTrailingSlash(
      parsedOptions.completeChatUrl || `${this.baseUrl}/models/${this.modelName}:generateContent?key=${this.apiKey}`
    );
    this.streamChatUrl = urlWithoutTrailingSlash(
      parsedOptions.streamChatUrl || `${this.baseUrl}/models/${this.modelName}:streamGenerateContent?key=${this.apiKey}`
    );
  }

  getDefaultBaseUrl(): UrlType {
    return this.baseUrl;
  }

  getDefaultHeaders(): HeadersType {
    return {
      "Content-Type": "application/json",
    };
  }

  getDefaultParams(): ParamsType {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number } {
    return { shouldRetry: false, delayMs: 0 };
  }

  // TODO: unused method, not tested; should add support for non-text modalities, tools
  getTokenCount(messages: MessageType[]): number {
    return messages.reduce((acc, message) => {
      return acc + message.content.map((content) => (content.modality === "text" ? content.value : "")).join(" ").length;
    }, 0);
  }

  transformModelRequest(request: GoogleChatRequestType): {
    modelName: string | undefined;
    config: ConfigType;
    messages: MessageType[];
    tools: ToolType[] | undefined;
  } {
    const safeRequest = GoogleChatRequest.safeParse(request);
    if (!safeRequest.success) {
      throw new InvalidModelRequestError({ info: "Invalid model request", cause: safeRequest.error });
    }

    const parsedRequest = safeRequest.data;

    const modelName = parsedRequest.model;

    if (parsedRequest.system_instruction && parsedRequest.systemInstruction) {
      throw new InvalidModelRequestError({
        info: `Invalid model request for model : '${this.modelName}'`,
        cause: new Error("'system_instruction' and 'systemInstruction' are not allowed at the same time"),
      });
    }

    if (parsedRequest.generation_config && parsedRequest.generationConfig) {
      throw new InvalidModelRequestError({
        info: `Invalid model request for model : '${this.modelName}'`,
        cause: new Error("'generation_config' and 'generationConfig' are not allowed at the same time"),
      });
    }

    if (parsedRequest.tool_config && parsedRequest.toolConfig) {
      throw new InvalidModelRequestError({
        info: `Invalid model request for model : '${this.modelName}'`,
        cause: new Error("'tool_config' and 'toolConfig' are not allowed at the same time"),
      });
    }

    const systemInstruction = parsedRequest.system_instruction || parsedRequest.systemInstruction;
    const generationConfig = parsedRequest.generation_config || parsedRequest.generationConfig;
    const safetySettings = parsedRequest.safety_settings || parsedRequest.safetySettings;
    const toolConfig = parsedRequest.tool_config || parsedRequest.toolConfig;

    if (toolConfig && (!parsedRequest.tools || parsedRequest.tools.function_declarations.length === 0)) {
      throw new InvalidModelRequestError({
        info: `Invalid model request for model : '${this.modelName}'`,
        cause: new Error("'tools' are required when 'tool_choice' is specified"),
      });
    }

    const _config: ConfigType = {};

    if (toolConfig) {
      if (toolConfig.function_calling_config.mode === "ANY") {
        if (
          toolConfig.function_calling_config.allowed_function_names &&
          toolConfig.function_calling_config.allowed_function_names.length === 1
        ) {
          _config.toolChoice = toolConfig.function_calling_config.allowed_function_names[0];
        } else {
          _config.toolChoice = toolConfig.function_calling_config.mode.toLowerCase();
        }
      } else {
        _config.toolChoice = toolConfig.function_calling_config.mode.toLowerCase();
      }
    }

    _config.seed = generationConfig?.seed;
    _config.maxTokens = generationConfig?.maxOutputTokens;
    _config.temperature = generationConfig?.temperature;
    _config.topP = generationConfig?.topP;
    _config.presencePenalty = generationConfig?.presencePenalty;
    _config.frequencyPenalty = generationConfig?.frequencyPenalty;
    _config.stop = generationConfig?.stopSequences;
    _config.safetySettings = safetySettings;
    const config = Config().parse(removeUndefinedEntries(_config));

    const messages: MessageType[] = [];
    if (systemInstruction) {
      systemInstruction.parts.forEach((part) => {
        messages.push({ role: SystemRoleLiteral, content: [{ modality: TextModalityLiteral, value: part.text }] });
      });
    }

    parsedRequest.contents.forEach((message) => {
      const role = message.role;
      switch (role) {
        case "user":
          {
            const content = message.parts as (GoogleChatContentPartTextType | GoogleChatContentPartInlineDataType)[];
            const _content = content.map((c) => {
              if ("text" in c) {
                return { modality: TextModalityLiteral, value: c.text };
              } else {
                return {
                  modality: ImageModalityLiteral,
                  detail: "auto" as ImageContentType["detail"],
                  value: {
                    type: Base64ImageContentTypeLiteral,
                    base64: c.inline_data.data,
                    mediaType: c.inline_data.mime_type.split("/")[1] as Base64ImageContentValueType["mediaType"],
                  },
                };
              }
            });
            messages.push({ role: role, content: _content });
          }
          break;

        case "model":
          {
            const content = message.parts as (GoogleChatContentPartTextType | GoogleChatContentPartFunctionCallType)[];
            const _content = content.map((c, index) => {
              if ("text" in c) {
                return { modality: TextModalityLiteral, value: c.text };
              } else {
                return {
                  modality: ToolCallModalityLiteral,
                  id: index.toString(),
                  index: index,
                  name: c.function_call.name,
                  arguments: JSON.stringify(c.function_call.args),
                };
              }
            });
            messages.push({ role: AssistantRoleLiteral, content: _content });
          }
          break;

        case "function":
          {
            const content = message.parts as GoogleChatContentPartFunctionResponseType[];
            const _content = content.map((c, index) => {
              return {
                modality: ToolResponseModalityLiteral,
                id: index.toString(),
                index: index,
                name: c.function_response.name,
                data: JSON.stringify(c.function_response.response),
              };
            });
            messages.push({ role: ToolRoleLiteral, content: _content });
          }
          break;

        default: {
          throw new InvalidMessagesError({
            info: `Invalid message 'role' for model : ${this.modelName}`,
            cause: new Error(`role : '${message.role}' is not supported for model : ${this.modelName}`),
          });
        }
      }
    });

    const tools: ToolType[] = [];
    if (parsedRequest.tools) {
      parsedRequest.tools.function_declarations.forEach((tool: GoogleChatToolType) => {
        tools.push({
          type: "function",
          definition: {
            schema: {
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters,
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

      if (key === "reasoningEnabled") {
        // Handle reasoningEnabled specially
        acc.thinkingConfig = {
          includeThoughts: paramValue,
        };
      } else if (key === "maxReasoningTokens") {
        acc.thinkingConfig =
          acc.thinkingConfig && typeof acc.thinkingConfig === "object"
            ? { ...acc.thinkingConfig, thinkingBudget: paramValue }
            : { thinkingBudget: paramValue };
      } else if (paramKey === "maxOutputTokens" && def.type === "range" && paramValue === 0) {
        acc[paramKey] = def.max;
      } else {
        acc[paramKey] = paramValue;
      }

      return acc;
    }, {} as ParamsType);

    const safetySettings = transformedConfig.safetySettings;
    delete transformedConfig.safetySettings;

    let toolConfig;
    if (_toolChoice !== undefined) {
      const toolChoice = _toolChoice as string;
      if (!tools || (tools && tools.length === 0)) {
        throw new InvalidConfigError({
          info: `Invalid config for model : '${this.modelName}'`,
          cause: new Error("'tools' are required when 'toolChoice' is specified"),
        });
      } else if (tools && tools.length > 0) {
        const configToolChoice = this.modelSchema.config.def.toolChoice as SelectStringConfigItemDefType;
        if (!configToolChoice.choices.includes(toolChoice)) {
          // toolChoice not in model schema choices
          if (tools.map((tool) => tool.definition.schema.name).includes(toolChoice)) {
            // toolChoice is a specific tool name
            toolConfig = {
              function_calling_config: {
                mode: "ANY",
                allowed_function_names: [toolChoice],
              },
            };
          } else {
            throw new InvalidConfigError({
              info: `Invalid config for model : '${this.modelName}'`,
              cause: new Error(`toolChoice : '${toolChoice}' is not part of provided 'tools' names or 
                one of [${configToolChoice.choices.join(", ")}]`),
            });
          }
        } else {
          // toolChoice is in model schema choices
          if (toolChoice === "any") {
            toolConfig = {
              function_calling_config: {
                mode: "ANY",
                allowed_function_names: tools.map((tool) => tool.definition.schema.name),
              },
            };
          } else {
            toolConfig = {
              function_calling_config: {
                mode: toolChoice.toUpperCase(), // Google uses uppercase for toolChoice
              },
            };
          }
        }
      }
    }

    if ("response_format" in transformedConfig && transformedConfig.response_format !== undefined) {
      const responseFormat = transformedConfig.response_format as string;
      if (responseFormat === "json_schema") {
        const responseSchemaConfig = transformedConfig.response_schema as ResponseSchemaType;
        if (!("response_schema" in transformedConfig) || !transformedConfig.response_schema || !responseSchemaConfig?.schema) {
          throw new InvalidConfigError({
            info: `Invalid config for model : '${this.modelName}'`,
            cause: new Error("'responseSchema' is required in config when 'responseFormat' is 'json_schema'"),
          });
        } else {
          transformedConfig.responseSchema = responseSchemaConfig.schema;
          transformedConfig.responseMimeType = "application/json";
          if ("additionalProperties" in responseSchemaConfig.schema) {
            // Google does not support additionalProperties in responseSchema but our schema always has it
            delete (transformedConfig.responseSchema as any).additionalProperties;
          }
          delete transformedConfig.response_format;
          delete transformedConfig.response_schema;
        }
      } else if (responseFormat === "json_object") {
        transformedConfig.responseSchema = {
          type: "object"
        };
        delete transformedConfig.response_format;
      } else if (responseFormat === "text") {
        delete transformedConfig.response_format;
      }
    }

    return {
      generation_config: transformedConfig,
      ...(toolConfig ? { tool_config: toolConfig } : {}),
      ...(safetySettings ? { safety_settings: safetySettings } : {}),
    };
  }

  transformMessages(messages: MessageType[]): ParamsType {
    if (!messages || (messages && messages.length === 0)) {
      return { messages: [] };
    }
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

    const systemInstruction: GoogleChatSystemInstructionType = { parts: [] };
    const nonSystemMessages: GoogleChatContentType[] = [];

    parsedMessages.forEach((message) => {
      switch (message.role) {
        case SystemRoleLiteral:
          {
            message.content.forEach((content) => {
              if (content.modality === TextModalityLiteral) {
                systemInstruction.parts.push({ text: content.value });
              } else {
                throw new InvalidMessagesError({
                  info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                  cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
                });
              }
            });
          }
          break;

        case AssistantRoleLiteral:
          {
            const assistantContent: GoogleChatContentType["parts"] = [];
            message.content.forEach((content) => {
              if (content.modality === TextModalityLiteral) {
                assistantContent.push({ text: content.value });
              } else if (content.modality === ToolCallModalityLiteral) {
                assistantContent.push({
                  function_call: {
                    name: content.name,
                    args: JSON.parse(content.arguments),
                  },
                });
              } else {
                throw new InvalidMessagesError({
                  info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                  cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
                });
              }
            });
            nonSystemMessages.push({
              role: this.modelSchema.roles[message.role] as GoogleChatContentType["role"],
              parts: assistantContent,
            });
          }
          break;

        case UserRoleLiteral:
          {
            const userContent: GoogleChatContentType["parts"] = [];
            message.content.forEach((content) => {
              if (content.modality === TextModalityLiteral) {
                userContent.push({ text: content.value });
              } else if (content.modality === ImageModalityLiteral) {
                if (content.value.type === "base64") {
                  let base64Data = content.value.base64;
                  // Check and strip the data URL prefix if it exists.
                  base64Data = stripBase64Prefix(base64Data);
                  userContent.push({
                    inline_data: {
                      mime_type: `image/${content.value.mediaType}`,
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
              role: this.modelSchema.roles[message.role] as GoogleChatContentType["role"],
              parts: userContent,
            });
          }
          break;

        case ToolRoleLiteral:
          {
            const toolResponseContent: GoogleChatContentPartFunctionResponseType[] = [];
            message.content.forEach((content) => {
              if (content.modality === ToolResponseModalityLiteral) {
                toolResponseContent.push({
                  function_response: {
                    name: content.name,
                    response: JSON.parse(content.data),
                  },
                });
              } else {
                throw new InvalidMessagesError({
                  info: `Invalid message 'role' and 'modality' combination for model : ${this.modelName}`,
                  cause: new Error(`role : '${message.role}' cannot have content with modality : '${content.modality}'`),
                });
              }
            });
            nonSystemMessages.push({
              role: this.modelSchema.roles[message.role] as GoogleChatContentType["role"],
              parts: toolResponseContent,
            });
          }
          break;

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

    // const getNextExpectedRoles = (role: string): string[] => {
    //   if (role === this.modelSchema.roles[UserRoleLiteral] || role === this.modelSchema.roles[ToolRoleLiteral]) {
    //     return [this.modelSchema.roles[AssistantRoleLiteral] as string];
    //   }
    //   return [this.modelSchema.roles[UserRoleLiteral] as string, this.modelSchema.roles[ToolRoleLiteral] as string];
    // };

    // for (let i = 1; i < nonSystemMessages.length; i++) {
    //   if (!getNextExpectedRoles(nonSystemMessages[i - 1].role).includes(nonSystemMessages[i].role)) {
    //     throw new InvalidMessagesError({
    //       info: `Invalid message format for model : ${this.modelName}`,
    //       cause: new Error(
    //         `model : '${this.modelName}' cannot have message with role : '${nonSystemMessages[i].role}' after message with role : '${nonSystemMessages[i - 1].role}'`
    //       ),
    //     });
    //   }
    // }

    if (
      nonSystemMessages[nonSystemMessages.length - 1].role !== this.modelSchema.roles[UserRoleLiteral] &&
      nonSystemMessages[nonSystemMessages.length - 1].role !== this.modelSchema.roles[ToolRoleLiteral]
    ) {
      throw new InvalidMessagesError({
        info: `Invalid message format for model : ${this.modelName}`,
        cause: new Error(`model : '${this.modelName}' requires last message to be from user`),
      });
    }

    return {
      contents: nonSystemMessages,
      ...(systemInstruction.parts.length > 0 ? { system_instruction: systemInstruction } : {}),
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
      parameters: tool.definition.schema.parameters,
    }));

    return {
      tools: [
        {
          function_declarations: transformedTools,
        },
      ],
    };
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
    const safe = GoogleCompleteChatResponse.safeParse(response);
    if (safe.success) {
      if (safe.data.candidates.length === 0) {
        throw new ModelResponseError({
          info: "Invalid response from model",
          cause: new Error(`No choices in response : ${JSON.stringify(safe.data)}`),
        });
      }

      const parsedResponse: GoogleCompleteChatResponseType = safe.data;
      const messages: MessageType[] = [];
      let usage: ChatUsageType | undefined;
      const _content = parsedResponse.candidates[0].content;
      if (_content) {
        const content = _content.parts.map((contentItem: any, index: any) => {
          if ("text" in contentItem && contentItem.text !== undefined) {
            return createTextContent(contentItem.text);
          } else if ("functionCall" in contentItem && contentItem.functionCall !== undefined) {
            return createToolCallContent(
              index,
              `${contentItem.functionCall.name}_${index}`,
              contentItem.functionCall.name,
              JSON.stringify(contentItem.functionCall.args)
            );
          }
        }) as ContentType[];

        messages.push({
          role: AssistantRoleLiteral,
          content: content,
        });

        if (parsedResponse.usageMetadata) {
          usage = {
            promptTokens: parsedResponse.usageMetadata.promptTokenCount,
            totalTokens: parsedResponse.usageMetadata.totalTokenCount,
            completionTokens: parsedResponse.usageMetadata.candidatesTokenCount || 0,
          };
        }

        return {
          messages: messages,
          usage: usage,
          logProbs: undefined,
        };
      }

      const safetyRatings = parsedResponse.candidates[0].safetyRatings;
      if (safetyRatings && safetyRatings.length > 0) {
        safetyRatings.forEach((rating) => {
          if (rating.blocked) {
            throw new ModelResponseError({
              info: `Blocked content for category: ${rating.category} with probability: ${rating.probability}`,
              cause: new Error(`Blocked content for category: ${rating.category} with probability: ${rating.probability}`),
            });
          }
        });
      }

      const finishReason = parsedResponse.candidates[0].finishReason;
      if (finishReason === "SAFETY") {
        throw new ModelResponseError({
          info: "Blocked content, model response finished with safety reason",
          cause: new Error("Blocked content, model response finished with safety reason"),
        });
      }
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
    const lines = (buffer + chunk).split(",\r").filter((line) => line.trim() !== "");
    for (const line of lines) {
      let completeLine = line;
      // remove all '\n' from string JSON
      completeLine = completeLine.replace(/\n/g, "");
      if (completeLine.startsWith("[") || completeLine.startsWith(",{")) {
        // start of stream, remove '['
        completeLine = completeLine.slice(1);
      } else if (completeLine.endsWith("]")) {
        if (completeLine === "]") {
          // strict end of stream
          return;
        } else {
          // remaining message and then end of stream, remove ']'
          completeLine = completeLine.slice(0, -1);
        }
      }

      let structuredLine: any;
      try {
        structuredLine = JSON.parse(completeLine);
      } catch (error) {
        // malformed JSON error, must be the end of loop
        if (error instanceof SyntaxError) {
          buffer = completeLine;
          continue;
        } else {
          // non JSON parse error, re-raise
          throw error;
        }
      }

      // reset buffer
      buffer = "";
      const safe = GoogleStreamChatResponse.safeParse(structuredLine);
      if (safe.success) {
        const partialResponse: PartialChatResponseType = { partialMessages: [] };
        const parsedResponse: GoogleStreamChatResponseType = safe.data;
        if (parsedResponse.candidates.length > 0) {
          const message = parsedResponse.candidates[0].content;
          if (message && "parts" in message && message.parts.length > 0) {
            message.parts.forEach((messagePart, index) => {
              if ("text" in messagePart && messagePart.text !== undefined) {
                partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, messagePart.text));
              }

              if ("functionCall" in messagePart && messagePart.functionCall !== undefined) {
                const toolCall = messagePart.functionCall;
                partialResponse.partialMessages.push(
                  createPartialToolCallMessage(
                    AssistantRoleLiteral,
                    index,
                    `${toolCall.name}_${index}`,
                    toolCall.name,
                    JSON.stringify(toolCall.args)
                  )
                );
              }
            });
          }
        }

        if (parsedResponse.usageMetadata) {
          partialResponse.usage = {
            promptTokens: parsedResponse.usageMetadata.promptTokenCount,
            completionTokens: parsedResponse.usageMetadata.candidatesTokenCount,
            totalTokens: parsedResponse.usageMetadata.totalTokenCount,
          };
        }

        yield { partialResponse: partialResponse, buffer: buffer };
      } else {
        throw new ModelResponseError({ info: "Invalid response from model", cause: safe.error });
      }
    }

    yield { partialResponse: { partialMessages: [] }, buffer: buffer };
  }
  async *transformProxyStreamChatResponseChunk(
    chunk: string,
    buffer: string,
    data?: any,
    headers?: Record<string, string>,
    query?: Record<string, string>
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    // If query has alt not equal to 'sse', delegate to streamTransform logic
    if (query?.alt !== "sse") {
      yield* this.transformStreamChatResponseChunk(chunk, buffer);
      return;
    }

    // --- proxyStreamTransform logic starts here ---
    const newData = buffer + chunk;
    let lines: string[] = [];
    let newBuffer = "";

    // Split newData into complete lines and new buffer
    let currentIndex = 0;
    while (currentIndex < newData.length) {
      const newlineIndex = newData.indexOf("\n", currentIndex);
      if (newlineIndex === -1) {
        newBuffer = newData.substring(currentIndex);
        break;
      } else {
        const line = newData.substring(currentIndex, newlineIndex).trim();
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
          const safe = GoogleStreamChatResponse.safeParse(structuredLine);
          if (safe.success) {
            const partialResponse: PartialChatResponseType = { partialMessages: [] };
            const parsedResponse: GoogleStreamChatResponseType = safe.data;
            if (parsedResponse.candidates.length > 0) {
              const message = parsedResponse.candidates[0].content;
              if (message && "parts" in message && message.parts.length > 0) {
                message.parts.forEach((messagePart, index) => {
                  if ("text" in messagePart && messagePart.text !== undefined) {
                    partialResponse.partialMessages.push(createPartialTextMessage(AssistantRoleLiteral, messagePart.text));
                  }

                  if ("functionCall" in messagePart && messagePart.functionCall !== undefined) {
                    const toolCall = messagePart.functionCall;
                    partialResponse.partialMessages.push(
                      createPartialToolCallMessage(
                        AssistantRoleLiteral,
                        index,
                        `${toolCall.name}_${index}`,
                        toolCall.name,
                        JSON.stringify(toolCall.args)
                      )
                    );
                  }
                });
              }
            }

            if (
              parsedResponse.usageMetadata &&
              parsedResponse.usageMetadata.totalTokenCount &&
              parsedResponse.usageMetadata.promptTokenCount &&
              parsedResponse.usageMetadata.candidatesTokenCount
            ) {
              partialResponse.usage = {
                promptTokens: parsedResponse.usageMetadata.promptTokenCount,
                completionTokens: parsedResponse.usageMetadata.candidatesTokenCount,
                totalTokens: parsedResponse.usageMetadata.totalTokenCount,
              };
            }

            yield { partialResponse: partialResponse, buffer: buffer };
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

  async getProxyCompleteChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType> {
    return new Promise((resolve) => {
      resolve(this.completeChatUrl);
    });
  }

  async getProxyStreamChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType> {
    return new Promise((resolve) => {
      if (!query || Object.keys(query).length === 0) {
        resolve(this.streamChatUrl);
        return;
      }

      const url = new URL(this.streamChatUrl);
      Object.entries(query).forEach(([key, value]) => {
        if (value != null) {
          url.searchParams.set(key, value);
        }
      });

      resolve(url.toString() as UrlType);
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

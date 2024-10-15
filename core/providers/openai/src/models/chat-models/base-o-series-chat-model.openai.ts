import { ChatModelSchemaType, HeadersType, InvalidModelRequestError, ModelError, ParamsType, UrlType } from "@adaline/provider";
import { ConfigType, MessageType, PartialChatResponseType, ToolType } from "@adaline/types";

import { BaseChatModel, BaseChatModelOptionsType } from "./base-chat-model.openai";
import { OpenAIChatOSeriesRequest, OpenAIChatOSeriesRequestType } from "./types";

class BaseOSeriesChatModel extends BaseChatModel {
  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    super(modelSchema, options);
  }

  transformModelRequest(request: OpenAIChatOSeriesRequestType): {
    modelName: string | undefined;
    config: ConfigType;
    messages: MessageType[];
    tools: ToolType[] | undefined;
  } {
    const safeRequest = OpenAIChatOSeriesRequest.safeParse(request);
    if (!safeRequest.success) {
      throw new InvalidModelRequestError({ info: "Invalid model request", cause: safeRequest.error });
    }

    const parsedRequest = safeRequest.data;
    const baseRequest = {
      ...parsedRequest,
      max_tokens: parsedRequest.max_completion_tokens,
    };
    delete baseRequest.max_completion_tokens;

    return super.transformModelRequest(baseRequest);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transformTools(tools: ToolType[]): ParamsType {
    throw new ModelError({
      info: `Model: '${this.modelSchema.name}' does not support 'tools'.`,
      cause: new Error(`Model: '${this.modelSchema.name}' does not support 'tools'.`),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStreamChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType> {
    throw new ModelError({
      info: `Model: '${this.modelSchema.name}' does not support streaming.`,
      cause: new Error(`Model: '${this.modelSchema.name}' does not support streaming.`),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStreamChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    throw new ModelError({
      info: `Model: '${this.modelSchema.name}' does not support streaming.`,
      cause: new Error(`Model: '${this.modelSchema.name}' does not support streaming.`),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStreamChatData(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType> {
    throw new ModelError({
      info: `Model: '${this.modelSchema.name}' does not support streaming.`,
      cause: new Error(`Model: '${this.modelSchema.name}' does not support streaming.`),
    });
  }

  async *transformStreamChatResponseChunk(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chunk: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    buffer: string
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    throw new ModelError({
      info: `Model: '${this.modelSchema.name}' does not support streaming.`,
      cause: new Error(`Model: '${this.modelSchema.name}' does not support streaming.`),
    });

    yield { partialResponse: { partialMessages: [] }, buffer: "" };
  }
}

export { BaseOSeriesChatModel };

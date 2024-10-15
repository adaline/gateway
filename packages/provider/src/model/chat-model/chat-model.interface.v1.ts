import { ChatResponseType, ConfigType, MessageType, PartialChatResponseType, ToolType } from "@adaline/types";

import { HeadersType, ParamsType, UrlType } from "../../types";
import { ChatModelSchemaType } from "./chat-model.schema.v1";

interface ChatModelV1<MS extends ChatModelSchemaType = ChatModelSchemaType> {
  readonly version: "v1";
  readonly modelSchema: MS;

  getDefaultBaseUrl(): UrlType;
  getDefaultHeaders(): HeadersType;
  getDefaultParams(): ParamsType;

  getRetryDelay(responseHeaders: HeadersType): { shouldRetry: boolean; delayMs: number };
  getTokenCount(messages: MessageType[]): number;

  transformModelRequest(request: any): {
    modelName: string | undefined;
    config: ConfigType;
    messages: MessageType[];
    tools: ToolType[] | undefined;
  };

  // TODO: these should be async, needed for downloading images, other media
  transformConfig(config: ConfigType, messages?: MessageType[], tools?: ToolType[]): ParamsType;
  transformMessages(messages: MessageType[]): ParamsType;
  transformTools(tools: ToolType[]): ParamsType;

  getCompleteChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType>;
  getCompleteChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType>;
  getCompleteChatData(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType>;
  transformCompleteChatResponse(response: any): ChatResponseType;

  getStreamChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType>;
  getStreamChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType>;
  getStreamChatData(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType>;
  transformStreamChatResponseChunk(
    chunk: string,
    buffer: string
  ): AsyncGenerator<{
    partialResponse: PartialChatResponseType;
    buffer: string;
  }>;
}

export { type ChatModelV1 };

import { ChatModelPriceType, ChatResponseType, ConfigType, MessageType, PartialChatResponseType, ToolType } from "@adaline/types";

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

  transformConfig(config: ConfigType, messages?: MessageType[], tools?: ToolType[]): ParamsType;
  transformMessages(messages: MessageType[], config?: ConfigType, tools?: ToolType[]): ParamsType;
  transformTools(tools: ToolType[], config?: ConfigType, messages?: MessageType[]): ParamsType;

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

  getProxyStreamChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType>;
  getProxyStreamChatHeaders(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<HeadersType>;
  transformProxyStreamChatResponseChunk(
    chunk: string,
    buffer: string,
    data?: any,
    headers?: Record<string, string>,
    query?: Record<string, string>
  ): AsyncGenerator<{
    partialResponse: PartialChatResponseType;
    buffer: string;
  }>;
  getProxyCompleteChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType>;
  getProxyCompleteChatHeaders(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<HeadersType>;
  getModelPricing(): ChatModelPriceType;
}

export { type ChatModelV1 };

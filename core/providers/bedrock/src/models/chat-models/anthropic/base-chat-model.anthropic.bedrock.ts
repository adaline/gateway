import { Sha256 } from "@aws-crypto/sha256-js";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";

import { BaseChatModel } from "@adaline/anthropic";
import { ChatModelSchemaType, encodedBase64ToString, HeadersType, ModelResponseError, ParamsType, UrlType } from "@adaline/provider";
import { ConfigType, MessageType, PartialChatResponseType, ToolType } from "@adaline/types";

import { Bedrock } from "../../../provider";
import { BaseChatModelOptions, type BaseChatModelOptionsType } from "../base-chat-model-options.bedrock";

class BaseChatModelAnthropic extends BaseChatModel {
  readonly version = "v1" as const;
  modelSchema: ChatModelSchemaType;
  modelName: string;

  private readonly awsUrl: string;
  private readonly awsService: string;
  private readonly awsRegion: string;
  private readonly awsAccessKeyId: string;
  private readonly awsSecretAccessKey: string;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    super(modelSchema, {
      apiKey: "random-api-key",
      modelName: parsedOptions.modelName,
    });
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.awsRegion = parsedOptions.awsRegion;
    this.awsUrl = Bedrock.awsUrl(this.awsRegion);
    this.awsService = Bedrock.awsService;
    this.awsAccessKeyId = parsedOptions.awsAccessKeyId;
    this.awsSecretAccessKey = parsedOptions.awsSecretAccessKey;
  }

  getDefaultBaseUrl(): UrlType {
    return this.awsUrl;
  }

  getDefaultHeaders(): HeadersType {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      host: this.awsUrl.split("://")[1], // remove 'https://' prefix
    };
  }

  getDefaultParams(): ParamsType {
    return {
      anthropic_version: "bedrock-2023-05-31",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCompleteChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType> {
    return new Promise((resolve) => {
      resolve(`${this.awsUrl}/model/${this.modelName}/invoke`);
    });
  }

  async getCompleteChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    const completeChatUrl = new URL(await this.getCompleteChatUrl(config, messages, tools));
    const credentials: AwsCredentialIdentity = { accessKeyId: this.awsAccessKeyId, secretAccessKey: this.awsSecretAccessKey };
    const headers = this.getDefaultHeaders();
    const body = this.getCompleteChatData(config || {}, messages || [], tools);

    const request = new HttpRequest({
      hostname: completeChatUrl.hostname,
      path: completeChatUrl.pathname,
      protocol: completeChatUrl.protocol,
      method: "POST",
      body: JSON.stringify(body),
      headers: headers,
    });

    const signer = new SignatureV4({
      credentials: credentials,
      service: this.awsService,
      region: this.awsRegion,
      sha256: Sha256,
    });

    const signedRequest = await signer.sign(request);
    return signedRequest.headers;
  }

  async getCompleteChatData(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType> {
    const data = {
      ...this.getDefaultParams(),
      ...super.getCompleteChatData(config, messages, tools),
    };

    return new Promise((resolve) => {
      resolve(data);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStreamChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType> {
    return new Promise((resolve) => {
      resolve(`${this.awsUrl}/model/${this.modelName}/invoke-with-response-stream`);
    });
  }

  async getStreamChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    const streamChatUrl = new URL(await this.getStreamChatUrl(config, messages, tools));
    const credentials: AwsCredentialIdentity = { accessKeyId: this.awsAccessKeyId, secretAccessKey: this.awsSecretAccessKey };
    const headers = this.getDefaultHeaders();
    const body = this.getCompleteChatData(config || {}, messages || [], tools);

    const request = new HttpRequest({
      hostname: streamChatUrl.hostname,
      path: streamChatUrl.pathname,
      protocol: streamChatUrl.protocol,
      method: "POST",
      body: JSON.stringify(body),
      headers: headers,
    });

    const signer = new SignatureV4({
      credentials: credentials,
      service: this.awsService,
      region: this.awsRegion,
      sha256: Sha256,
    });

    const signedRequest = await signer.sign(request);
    return signedRequest.headers;
  }

  async getStreamChatData(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType> {
    const data = {
      ...this.getDefaultParams(),
      ...super.getStreamChatData(config, messages, tools),
    };

    if ("stream" in data) {
      delete data.stream;
    }

    return data;
  }

  async *transformStreamChatResponseChunk(
    chunk: string,
    buffer: string
  ): AsyncGenerator<{ partialResponse: PartialChatResponseType; buffer: string }> {
    const lines = chunk.toString();
    // Regex to extract JSON objects starting with `{"bytes":` and ending with `}`
    const bytesRegex = /{\s*"bytes"\s*:\s*"[\w=+/]+".*?}/g;
    const matches = lines.match(bytesRegex) || [];
    for (const line of matches) {
      const startParenthesis = line.indexOf("{");
      const endParenthesis = line.indexOf("}");
      if (startParenthesis !== -1 && endParenthesis !== -1 && startParenthesis < endParenthesis) {
        let structuredLine;
        try {
          structuredLine = JSON.parse(line.slice(startParenthesis, endParenthesis + 1));
        } catch (error) {
          // malformed JSON error
          throw new ModelResponseError({
            info: "Malformed JSON received in stream",
            cause: new Error(`Malformed JSON received in stream : ${structuredLine}`),
          });
        }
        const data_delta = encodedBase64ToString(structuredLine["bytes"]);
        const transformed = (await super.transformStreamChatResponseChunk(`data: ${data_delta}`, buffer).next()).value;
        if (transformed) {
          yield transformed;
        }
      }
    }
  }
}

export { BaseChatModelAnthropic };

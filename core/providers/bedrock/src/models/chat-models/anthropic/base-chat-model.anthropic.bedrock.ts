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

  private readonly awsService: string;
  private readonly awsAccessKeyId: string;
  private readonly awsSecretAccessKey: string;
  private getAwsUrl(region: string): string {
    return Bedrock.awsUrl(region);
  }

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    super(modelSchema, {
      apiKey: "random-api-key",
      modelName: parsedOptions.modelName,
    });
    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.awsService = Bedrock.awsService;
    this.awsAccessKeyId = parsedOptions.awsAccessKeyId;
    this.awsSecretAccessKey = parsedOptions.awsSecretAccessKey;
  }

  getDefaultBaseUrl(): UrlType {
    return Bedrock.awsUrl();
  }

  getDefaultHeaders(): HeadersType {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  getDefaultParams(): ParamsType {
    return {
      anthropic_version: "bedrock-2023-05-31",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCompleteChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType> {
    if (!config || !(config && config.awsRegion)) {
      throw new ModelResponseError({
        info: "AWS Region is required in the config",
        cause: new Error("AWS Region is required in the config"),
      });
    }
    const awsUrl = this.getAwsUrl(config.awsRegion);
    return new Promise((resolve) => {
      resolve(`${awsUrl}/model/${this.modelName}/invoke`);
    });
  }

  transformConfig(config: ConfigType, messages?: MessageType[], tools?: ToolType[]): ParamsType {
    const _config = { ...config }; // create a copy to avoid mutating the original config
    delete _config.awsRegion; // Region is not used in the config

    // Call the base class method with the modified config
    return super.transformConfig(_config, messages, tools);
  }

  async getCompleteChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    const completeChatUrl = new URL(await this.getCompleteChatUrl(config, messages, tools));
    const credentials: AwsCredentialIdentity = { accessKeyId: this.awsAccessKeyId, secretAccessKey: this.awsSecretAccessKey };
    const awsRegion = config?.awsRegion;

    let headers = this.getDefaultHeaders();
    headers = {
      ...headers,
      host: this.getAwsUrl(awsRegion).split("://")[1], // remove 'https://' prefix
    };
    const body = await this.getCompleteChatData(config || {}, messages || [], tools);
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
      region: awsRegion,
      sha256: Sha256,
    });

    const signedRequest = await signer.sign(request);
    return signedRequest.headers;
  }

  async getCompleteChatData(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType> {
    const data = {
      ...this.getDefaultParams(),
      ...(await super.getCompleteChatData(config, messages, tools)),
    };

    return new Promise((resolve) => {
      resolve(data);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStreamChatUrl(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<UrlType> {
    if (!config || !(config && config.awsRegion)) {
      throw new ModelResponseError({
        info: "AWS Region is required in the config",
        cause: new Error("AWS Region is required in the config"),
      });
    }
    const awsUrl = this.getAwsUrl(config.awsRegion);
    return new Promise((resolve) => {
      resolve(`${awsUrl}/model/${this.modelName}/invoke-with-response-stream`);
    });
  }

  async getStreamChatHeaders(config?: ConfigType, messages?: MessageType[], tools?: ToolType[]): Promise<HeadersType> {
    const streamChatUrl = new URL(await this.getStreamChatUrl(config, messages, tools));
    const credentials: AwsCredentialIdentity = { accessKeyId: this.awsAccessKeyId, secretAccessKey: this.awsSecretAccessKey };
    const awsRegion = config?.awsRegion;

    let headers = this.getDefaultHeaders();
    headers = {
      ...headers,
      host: this.getAwsUrl(awsRegion).split("://")[1], // remove 'https://' prefix
    };
    const body = await this.getCompleteChatData(config || {}, messages || [], tools);
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
      region: awsRegion,
      sha256: Sha256,
    });

    const signedRequest = await signer.sign(request);
    return signedRequest.headers;
  }

  async getStreamChatData(config: ConfigType, messages: MessageType[], tools?: ToolType[]): Promise<ParamsType> {
    const data = {
      ...this.getDefaultParams(),
      ...(await super.getStreamChatData(config, messages, tools)),
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
            info: `Malformed JSON received in stream : ${structuredLine}`,
            cause: error,
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

  private getRegionHelper(headers: Record<string, string>): string {
    let awsRegion = headers["aws-region"];
    if (!awsRegion) {
      const match = headers["authorization"]?.match(/Credential=[^/]+\/\d+\/([^/]+)\/bedrock/);
      if (match) {
        awsRegion = match[1];
      }
    }
    return awsRegion;
  }
  async getProxyStreamChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType> {
    const awsRegion = this.getRegionHelper(headers || {});
    const awsUrl = this.getAwsUrl(awsRegion);
    return new Promise((resolve) => {
      resolve(`${awsUrl}/model/${this.modelName}/invoke-with-response-stream`);
    });
  }

  // Helper function to sign chat headers
  private async getProxyChatHeaders(
    urlFetcher: () => Promise<string>,
    data?: any,
    headers?: Record<string, string>,
    query?: Record<string, string>
  ): Promise<HeadersType> {
    const chatUrl = new URL(await urlFetcher());
    if (!headers) return {};

    const awsAccessKeyId = headers["aws-access-key-id"];
    const awsSecretAccessKey = headers["aws-secret-access-key"];
    const awsRegion = this.getRegionHelper(headers);

    if (!awsAccessKeyId || !awsSecretAccessKey) return {};

    const credentials: AwsCredentialIdentity = { accessKeyId: awsAccessKeyId, secretAccessKey: awsSecretAccessKey };

    headers = { ...headers, host: chatUrl.host, "content-type": "application/json", accept: "application/json" };

    delete headers["content-length"];

    const request = new HttpRequest({
      hostname: chatUrl.hostname,
      path: chatUrl.pathname,
      protocol: chatUrl.protocol,
      method: "POST",
      body: JSON.stringify(data),
      headers: headers,
    });

    const signer = new SignatureV4({
      credentials: credentials,
      service: this.awsService,
      region: awsRegion,
      sha256: Sha256,
    });

    const signedRequest = await signer.sign(request);
    return signedRequest.headers;
  }
  async getProxyCompleteChatUrl(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<UrlType> {
    const awsRegion = this.getRegionHelper(headers || {});
    const awsUrl = this.getAwsUrl(awsRegion);
    return new Promise((resolve) => {
      resolve(`${awsUrl}/model/${this.modelName}/invoke`);
    });
  }

  // Use the helper function for complete chat headers
  async getProxyCompleteChatHeaders(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<HeadersType> {
    return this.getProxyChatHeaders(() => this.getProxyCompleteChatUrl(data, headers, query), data, headers, query);
  }

  // Use the helper function for stream chat headers
  async getProxyStreamChatHeaders(data?: any, headers?: Record<string, string>, query?: Record<string, string>): Promise<HeadersType> {
    return this.getProxyChatHeaders(() => this.getProxyStreamChatUrl(data, headers, query), data, headers, query);
  }
}

export { BaseChatModelAnthropic };

import { BaseChatModel } from "@adaline/openai";
import { ChatModelSchemaType, HeadersType, ModelError } from "@adaline/provider";

import { Azure } from "../../../provider";
import { BaseChatModelOptions, BaseChatModelOptionsType } from "../chat-model-options.azure";

class BaseChatModelOpenAI extends BaseChatModel {
  readonly version = "v1" as const;
  modelSchema: ChatModelSchemaType;
  readonly deploymentId: string;

  private readonly azureApiKey: string;
  private readonly azureApiVersion: string;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);

    let baseUrl;
    if (parsedOptions.baseUrl) {
      baseUrl = parsedOptions.baseUrl;
    } else if (parsedOptions.resourceName) {
      baseUrl = Azure.azureUrl(parsedOptions.resourceName, "openai");
    } else {
      throw new ModelError({
        info: "Either 'baseUrl' or 'resourceName' must be provided",
        cause: new Error("Either 'baseUrl' or 'resourceName' must be provided"),
      });
    }

    const azureApiVersion = "2024-06-01";
    const azureDeploymentUrl = `${baseUrl}/openai/deployments/${parsedOptions.deploymentId}`;

    super(modelSchema, {
      modelName: parsedOptions.deploymentId,
      apiKey: parsedOptions.apiKey,
      baseUrl: azureDeploymentUrl,
      completeChatUrl: `${azureDeploymentUrl}/chat/completions?api-version=${azureApiVersion}`,
      streamChatUrl: `${azureDeploymentUrl}/chat/completions?api-version=${azureApiVersion}`,
    });
    this.modelSchema = modelSchema;
    this.deploymentId = parsedOptions.deploymentId;
    this.azureApiKey = parsedOptions.apiKey;
    this.azureApiVersion = azureApiVersion;
  }

  getDefaultHeaders(): HeadersType {
    return {
      "Content-Type": "application/json",
      "api-key": this.azureApiKey,
      source: "adaline",
    };
  }
}

export { BaseChatModelOpenAI };

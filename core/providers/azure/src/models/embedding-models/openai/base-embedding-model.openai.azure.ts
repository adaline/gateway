import { BaseEmbeddingModel } from "@adaline/openai";
import { EmbeddingModelSchemaType, HeadersType, ModelError, ModelResponseError } from "@adaline/provider";
import { EmbeddingModelPriceType } from "@adaline/types";

import { Azure } from "../../../provider";
import { BaseEmbeddingModelOptions, BaseEmbeddingModelOptionsType } from "../embedding-model-options.azure";

class BaseEmbeddingModelOpenAI extends BaseEmbeddingModel {
  readonly version = "v1" as const;
  modelSchema: EmbeddingModelSchemaType;
  readonly deploymentId: string;

  private readonly azureApiKey: string;
  private readonly azureApiVersion: string;

  constructor(modelSchema: EmbeddingModelSchemaType, options: BaseEmbeddingModelOptionsType) {
    const parsedOptions = BaseEmbeddingModelOptions.parse(options);

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
      getEmbeddingsUrl: `${azureDeploymentUrl}/embeddings?api-version=${azureApiVersion}`,
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

  getModelPricing(): EmbeddingModelPriceType {
    throw new ModelResponseError({
      info: `Invalid model pricing for model : '${this.modelName}'`,
      cause: new Error(`Pricing configuration not supported for azure provider.`),
    });
  }
}

export { BaseEmbeddingModelOpenAI };

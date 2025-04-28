import { z } from "zod";

import { BaseChatModel } from "@adaline/google";
import { ChatModelSchemaType, HeadersType, ModelError, ModelResponseError } from "@adaline/provider";
import { ChatModelPriceType } from "@adaline/types";

import { Vertex } from "../../provider/provider.vertex";
import pricingData from "../pricing.json";

const BaseChatModelOptions = z.object({
  accessToken: z.string(),
  modelName: z.string(),
  baseUrl: z.string().url().optional(),
  location: z.string().optional(),
  projectId: z.string().optional(),
  publisher: z.string().optional(),
});
type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

class BaseChatModelVertex extends BaseChatModel {
  readonly version = "v1" as const;
  modelSchema: ChatModelSchemaType;
  modelName: string;

  private readonly accessToken: string;
  private readonly location: string | undefined;
  private readonly projectId: string | undefined;
  private readonly publisher: string | undefined;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    let baseUrl: string | undefined;

    if (parsedOptions.baseUrl) {
      baseUrl = parsedOptions.baseUrl;
    } else if (parsedOptions.location && parsedOptions.projectId) {
      baseUrl = Vertex.baseUrl(parsedOptions.location, parsedOptions.projectId, parsedOptions.publisher);
    } else {
      throw new ModelError({
        info: "Either 'baseUrl' must be provided or 'location' and 'projectId' must be provided",
        cause: new Error("Either 'baseUrl' must be provided or 'location' and 'projectId' must be provided"),
      });
    }

    super(modelSchema, {
      modelName: parsedOptions.modelName,
      apiKey: "random-api-key",
      completeChatUrl: `${baseUrl}/models/${parsedOptions.modelName}:generateContent`,
      streamChatUrl: `${baseUrl}/models/${parsedOptions.modelName}:streamGenerateContent`,
    });

    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.accessToken = parsedOptions.accessToken;
    this.location = parsedOptions.location;
    this.projectId = parsedOptions.projectId;
    this.publisher = parsedOptions.publisher;
  }

  getDefaultHeaders(): HeadersType {
    return {
      ...super.getDefaultHeaders(),
      Authorization: `Bearer ${this.accessToken}`,
    };
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

export { BaseChatModelOptions, BaseChatModelVertex, type BaseChatModelOptionsType };

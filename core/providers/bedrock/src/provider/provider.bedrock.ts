import { z } from "zod";

import { ChatModelSchemaType, ChatModelV1, EmbeddingModelSchemaType, EmbeddingModelV1, ProviderError, ProviderV1 } from "@adaline/provider";

import * as Models from "../models";

const ProviderLiteral = "bedrock";
class Bedrock<C extends Models.BaseChatModelOptionsType, E extends Record<string, any> = Record<string, any>> implements ProviderV1<C, E> {
  readonly version = "v1" as const;
  readonly name = ProviderLiteral;
  static readonly awsService = "bedrock";
  static readonly awsDefaultRegion = "us-east-1";
  static readonly awsUrl = (awsRegion?: string): string => `https://bedrock-runtime.${awsRegion ?? this.awsDefaultRegion}.amazonaws.com`;

  private readonly chatModelFactories: Record<
    string,
    {
      model: { new (options: any): ChatModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: ChatModelSchemaType;
    }
  > = {
    [Models.BedrockClaude3Haiku20240307Literal]: {
      model: Models.BedrockClaude3Haiku20240307,
      modelOptions: Models.BedrockClaude3Haiku20240307Options,
      modelSchema: Models.BedrockClaude3Haiku20240307Schema,
    },
    [Models.BedrockClaude3Sonnet20240229Literal]: {
      model: Models.BedrockClaude3Sonnet20240229,
      modelOptions: Models.BedrockClaude3Sonnet20240229Options,
      modelSchema: Models.BedrockClaude3Sonnet20240229Schema,
    },
    [Models.BedrockClaude3Opus20240229Literal]: {
      model: Models.BedrockClaude3Opus20240229,
      modelOptions: Models.BedrockClaude3Opus20240229Options,
      modelSchema: Models.BedrockClaude3Opus20240229Schema,
    },
    [Models.BedrockClaude3_5Sonnet20240620Literal]: {
      model: Models.BedrockClaude3_5Sonnet20240620,
      modelOptions: Models.BedrockClaude3_5Sonnet20240620Options,
      modelSchema: Models.BedrockClaude3_5Sonnet20240620Schema,
    },
    [Models.BedrockClaude3_5Sonnet20241022Literal]: {
      model: Models.BedrockClaude3_5Sonnet20241022,
      modelOptions: Models.BedrockClaude3_5Sonnet20241022Options,
      modelSchema: Models.BedrockClaude3_5Sonnet20241022Schema,
    },
    [Models.BedrockClaude3_5Haiku20241022Literal]: {
      model: Models.BedrockClaude3_5Haiku20241022,
      modelOptions: Models.BedrockClaude3_5Haiku20241022Options,
      modelSchema: Models.BedrockClaude3_5Haiku20241022Schema,
    },
    [Models.BedrockClaude3_7Sonnet20250219Literal]: {
      model: Models.BedrockClaude3_7Sonnet20250219,
      modelOptions: Models.BedrockClaude3_7Sonnet20250219Options,
      modelSchema: Models.BedrockClaude3_7Sonnet20250219Schema,
    },
    [Models.BedrockClaude4Sonnet20250514Literal]: {
      model: Models.BedrockClaude4Sonnet20250514,
      modelOptions: Models.BedrockClaude4Sonnet20250514Options,
      modelSchema: Models.BedrockClaude4Sonnet20250514Schema,
    },
    [Models.BedrockClaudeSonnet4_520250929Literal]: {
      model: Models.BedrockClaudeSonnet4_520250929,
      modelOptions: Models.BedrockClaudeSonnet4_520250929Options,
      modelSchema: Models.BedrockClaudeSonnet4_520250929Schema,
    },
    [Models.BedrockClaudeSonnet4_6Literal]: {
      model: Models.BedrockClaudeSonnet4_6,
      modelOptions: Models.BedrockClaudeSonnet4_6Options,
      modelSchema: Models.BedrockClaudeSonnet4_6Schema,
    },
    [Models.BedrockClaudeHaiku4_520251001Literal]: {
      model: Models.BedrockClaudeHaiku4_520251001,
      modelOptions: Models.BedrockClaudeHaiku4_520251001Options,
      modelSchema: Models.BedrockClaudeHaiku4_520251001Schema,
    },
    [Models.BedrockClaude4Opus20250514Literal]: {
      model: Models.BedrockClaude4Opus20250514,
      modelOptions: Models.BedrockClaude4Opus20250514Options,
      modelSchema: Models.BedrockClaude4Opus20250514Schema,
    },
    [Models.BedrockClaudeOpus4_520251101Literal]: {
      model: Models.BedrockClaudeOpus4_520251101,
      modelOptions: Models.BedrockClaudeOpus4_520251101Options,
      modelSchema: Models.BedrockClaudeOpus4_520251101Schema,
    },
    [Models.BedrockClaudeOpus4_6Literal]: {
      model: Models.BedrockClaudeOpus4_6,
      modelOptions: Models.BedrockClaudeOpus4_6Options,
      modelSchema: Models.BedrockClaudeOpus4_6Schema,
    },
  };

  private readonly embeddingModelFactories: Record<
    string,
    {
      model: { new (options: any): EmbeddingModelV1 };
      modelOptions: z.ZodType<any>;
      modelSchema: EmbeddingModelSchemaType;
    }
  > = {};

  chatModelLiterals(): string[] {
    return Object.keys(this.chatModelFactories);
  }

  chatModelSchemas(): Record<string, ChatModelSchemaType> {
    return Object.keys(this.chatModelFactories).reduce(
      (acc, key) => {
        acc[key] = this.chatModelFactories[key].modelSchema;
        return acc;
      },
      {} as Record<string, ChatModelSchemaType>
    );
  }

  chatModel(options: C): ChatModelV1 {
    const modelName = options.modelName;

    const inferenceProfilePattern = /^(global|us|eu|ap|me|sa|af|an)\./;

    const actualModelName = inferenceProfilePattern.test(modelName) ? modelName.replace(inferenceProfilePattern, "") : modelName;

    if (!(actualModelName in this.chatModelFactories)) {
      throw new ProviderError({
        info: `Bedrock chat model: ${actualModelName} not found`,
        cause: new Error(`Bedrock chat model: ${actualModelName} not found, available chat models: 
          ${this.chatModelLiterals().join(", ")}`),
      });
    }

    const model = this.chatModelFactories[actualModelName].model;
    const parsedOptions = this.chatModelFactories[actualModelName].modelOptions.parse(options);
    return new model({ ...parsedOptions, modelName: modelName });
  }

  embeddingModelLiterals(): string[] {
    return Object.keys(this.embeddingModelFactories);
  }

  embeddingModelSchemas(): Record<string, EmbeddingModelSchemaType> {
    return Object.keys(this.embeddingModelFactories).reduce(
      (acc, key) => {
        acc[key] = this.embeddingModelFactories[key].modelSchema;
        return acc;
      },
      {} as Record<string, EmbeddingModelSchemaType>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  embeddingModel(options: E): EmbeddingModelV1 {
    throw new ProviderError({
      info: "Adaline Bedrock provider does not support embedding models yet",
      cause: new Error("Adaline Bedrock provider does not support embedding models yet"),
    });
  }
}

export { Bedrock };

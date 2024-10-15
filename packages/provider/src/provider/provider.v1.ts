import { ChatModelSchemaType, ChatModelV1 } from "../model/chat-model";
import { EmbeddingModelSchemaType, EmbeddingModelV1 } from "../model/embedding-model";

interface ProviderV1<
  C extends Record<string, any> = Record<string, any>,
  E extends Record<string, any> = Record<string, any>
> {
  readonly version: "v1";
  readonly name: string;

  chatModelLiterals(): string[];
  chatModelSchemas(): Record<string, ChatModelSchemaType>;
  chatModel(options: C): ChatModelV1;

  embeddingModelLiterals(): string[];
  embeddingModelSchemas(): Record<string, EmbeddingModelSchemaType>;
  embeddingModel(options: E): EmbeddingModelV1;
};

export { type ProviderV1 };

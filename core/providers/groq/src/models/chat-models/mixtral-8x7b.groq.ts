import { z } from "zod";

import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelTextToolModalities,
  OpenAIChatModelTextToolModalitiesEnum,
} from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

const Mixtral_8x7bLiteral = "mixtral-8x7b-32768" as const;
// https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
const Mixtral_8x7bDescription = "The Mixtral-8x7B Large Language Model (LLM) is a pretrained generative Sparse Mixture of Experts.";

const Mixtral_8x7bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Mixtral_8x7bLiteral,
  description: Mixtral_8x7bDescription,
  maxInputTokens: 32768,
  maxOutputTokens: 4096,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(4096).def,
    schema: GroqChatModelConfigs.base(4096).schema,
  },
});

const Mixtral_8x7bOptions = BaseChatModelOptions;
type Mixtral_8x7bOptionsType = z.infer<typeof Mixtral_8x7bOptions>;

class Mixtral_8x7b extends BaseChatModelGroq {
  constructor(options: Mixtral_8x7bOptionsType) {
    super(Mixtral_8x7bSchema, options);
  }
}

export { Mixtral_8x7b, Mixtral_8x7bOptions, Mixtral_8x7bSchema, Mixtral_8x7bLiteral, type Mixtral_8x7bOptionsType };

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

const Gemma_7b_ITLiteral = "gemma-7b-it" as const;
// https://huggingface.co/google/gemma-1.1-7b-it
const Gemma_7b_ITDescription =
  "Gemma is a family of lightweight, state-of-the-art open models from Google, \
  built from the same research and technology used to create the Gemini models.";

const Gemma_7b_ITSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Gemma_7b_ITLiteral,
  description: Gemma_7b_ITDescription,
  maxInputTokens: 8192,
  maxOutputTokens: 4096,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(4096).def,
    schema: GroqChatModelConfigs.base(4096).schema,
  },
});

const Gemma_7b_ITOptions = BaseChatModelOptions;
type Gemma_7b_ITOptionsType = z.infer<typeof Gemma_7b_ITOptions>;

class Gemma_7b_IT extends BaseChatModelGroq {
  constructor(options: Gemma_7b_ITOptionsType) {
    super(Gemma_7b_ITSchema, options);
  }
}

export { Gemma_7b_IT, Gemma_7b_ITOptions, Gemma_7b_ITSchema, Gemma_7b_ITLiteral, type Gemma_7b_ITOptionsType };

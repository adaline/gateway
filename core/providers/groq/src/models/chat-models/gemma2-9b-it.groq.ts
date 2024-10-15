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

const Gemma2_9b_ITLiteral = "gemma2-9b-it" as const;
// https://huggingface.co/google/gemma-2-9b-it
const Gemma2_9b_ITDescription =
  "Gemma is a family of lightweight, state-of-the-art open models from Google, \
  built from the same research and technology used to create the Gemini models.";

const Gemma2_9b_ITSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Gemma2_9b_ITLiteral,
  description: Gemma2_9b_ITDescription,
  maxInputTokens: 8192,
  maxOutputTokens: 4096,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(4096).def,
    schema: GroqChatModelConfigs.base(4096).schema,
  },
});

const Gemma2_9b_ITOptions = BaseChatModelOptions;
type Gemma2_9b_ITOptionsType = z.infer<typeof Gemma2_9b_ITOptions>;

class Gemma2_9b_IT extends BaseChatModelGroq {
  constructor(options: Gemma2_9b_ITOptionsType) {
    super(Gemma2_9b_ITSchema, options);
  }
}

export { Gemma2_9b_IT, Gemma2_9b_ITOptions, Gemma2_9b_ITSchema, Gemma2_9b_ITLiteral, type Gemma2_9b_ITOptionsType };

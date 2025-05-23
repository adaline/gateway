import { z } from "zod";

import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelTextToolModalities,
  OpenAIChatModelTextToolModalitiesEnum,
} from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

const Llama_3_1_8bLiteral = "llama-3.1-8b-instant" as const;
// https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md
const Llama_3_1_8bDescription =
  "The Llama 3.1 instruction tuned text only models (8B, 70B, 405B) are optimized for multilingual dialogue use cases and \
  outperform many of the available open source and closed chat models on common industry benchmarks.";

const Llama_3_1_8bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_3_1_8bLiteral,
  description: Llama_3_1_8bDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 8192,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(8192).def,
    schema: GroqChatModelConfigs.base(8192).schema,
  },
  price: pricingData[Llama_3_1_8bLiteral],
});

const Llama_3_1_8b_Options = BaseChatModelOptions;
type Llama_3_1_8b_OptionsType = z.infer<typeof Llama_3_1_8b_Options>;

class Llama_3_1_8b extends BaseChatModelGroq {
  constructor(options: Llama_3_1_8b_OptionsType) {
    super(Llama_3_1_8bSchema, options);
  }
}

export { Llama_3_1_8b, Llama_3_1_8b_Options, Llama_3_1_8bLiteral, Llama_3_1_8bSchema, type Llama_3_1_8b_OptionsType };

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

const Qwen3_32bLiteral = "qwen/qwen3-32b" as const;
const Qwen3_32bDescription =
  "Qwen 3 32B is the latest generation of large language models in the Qwen series, offering groundbreaking advancements in reasoning, instruction-following, agent capabilities, and multilingual support. It uniquely supports seamless switching between thinking mode (for complex logical reasoning, math, and coding) and non-thinking mode (for efficient, general-purpose dialogue) within a single model. ";

const Qwen3_32bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Qwen3_32bLiteral,
  description: Qwen3_32bDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 40960,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(40960).def,
    schema: GroqChatModelConfigs.base(40960).schema,
  },
  price: pricingData[Qwen3_32bLiteral],
});

const Qwen3_32b_Options = BaseChatModelOptions;
type Qwen3_32b_OptionsType = z.infer<typeof Qwen3_32b_Options>;

class Qwen3_32b extends BaseChatModelGroq {
  constructor(options: Qwen3_32b_OptionsType) {
    super(Qwen3_32bSchema, options);
  }
}

export { Qwen3_32b, Qwen3_32b_Options, Qwen3_32bLiteral, Qwen3_32bSchema, type Qwen3_32b_OptionsType };

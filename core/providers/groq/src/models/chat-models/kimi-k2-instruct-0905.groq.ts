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

// Specs reference: https://console.groq.com/docs/models (retrieved 2026-02-25)
const Kimi_K2_Instruct_0905Literal = "moonshotai/kimi-k2-instruct-0905" as const;
const Kimi_K2_Instruct_0905Description =
  "Kimi K2 Instruct 0905 with 262K context window, optimized for tool use, coding, and multi-step agent workflows.";

const Kimi_K2_Instruct_0905Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Kimi_K2_Instruct_0905Literal,
  description: Kimi_K2_Instruct_0905Description,
  maxInputTokens: 262144,
  maxOutputTokens: 16384,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(16384).def,
    schema: GroqChatModelConfigs.base(16384).schema,
  },
  price: pricingData[Kimi_K2_Instruct_0905Literal],
});

const Kimi_K2_Instruct_0905_Options = BaseChatModelOptions;
type Kimi_K2_Instruct_0905_OptionsType = z.infer<typeof Kimi_K2_Instruct_0905_Options>;

class Kimi_K2_Instruct_0905 extends BaseChatModelGroq {
  constructor(options: Kimi_K2_Instruct_0905_OptionsType) {
    super(Kimi_K2_Instruct_0905Schema, options);
  }
}

export {
  Kimi_K2_Instruct_0905,
  Kimi_K2_Instruct_0905_Options,
  Kimi_K2_Instruct_0905Literal,
  Kimi_K2_Instruct_0905Schema,
  type Kimi_K2_Instruct_0905_OptionsType,
};


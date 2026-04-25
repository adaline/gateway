import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelWithWebSearchModalities,
  OpenAIChatModelWithWebSearchModalitiesEnum,
} from "./types";

// Specs reference: https://developers.openai.com/api/docs/models/gpt-5.5 (retrieved 2026-04-25)
// First fully retrained base model since GPT-4.5; 5.1–5.4 were post-training iterations on the same base.
const GPT_5_5Literal = "gpt-5.5";
const GPT_5_5Description =
  "Frontier GPT-5.5 model — first fully retrained base since GPT-4.5 — for complex professional work with native \
  computer-use, agentic, coding, and reasoning capabilities. Training data up to December 2025.";

const GPT_5_5Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelWithWebSearchModalitiesEnum).parse({
  name: GPT_5_5Literal,
  description: GPT_5_5Description,
  maxInputTokens: 1050000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelWithWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5_2PlusWithWebSearch(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5_2PlusWithWebSearch(128000, 4).schema,
  },
  price: pricingData[GPT_5_5Literal],
});

const GPT_5_5Options = BaseChatModelOptions;
type GPT_5_5OptionsType = z.infer<typeof GPT_5_5Options>;

class GPT_5_5 extends BaseChatModel {
  constructor(options: GPT_5_5OptionsType) {
    super(GPT_5_5Schema, options);
  }
}

export { GPT_5_5, GPT_5_5Literal, GPT_5_5Options, GPT_5_5Schema, type GPT_5_5OptionsType };

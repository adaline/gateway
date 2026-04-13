import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

// Specs reference: https://developers.openai.com/api/docs/models/gpt-5.4 (retrieved 2026-04-13)
const GPT_5_4Literal = "gpt-5.4";
const GPT_5_4Description =
  "Frontier GPT-5.4 model for complex professional work with native computer-use, agentic, coding, and reasoning capabilities. \
  Training data up to August 2025.";

const GPT_5_4Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5_4Literal,
  description: GPT_5_4Description,
  maxInputTokens: 1050000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(128000, 4).schema,
  },
  price: pricingData[GPT_5_4Literal],
});

const GPT_5_4Options = BaseChatModelOptions;
type GPT_5_4OptionsType = z.infer<typeof GPT_5_4Options>;

class GPT_5_4 extends BaseChatModel {
  constructor(options: GPT_5_4OptionsType) {
    super(GPT_5_4Schema, options);
  }
}

export { GPT_5_4, GPT_5_4Literal, GPT_5_4Options, GPT_5_4Schema, type GPT_5_4OptionsType };

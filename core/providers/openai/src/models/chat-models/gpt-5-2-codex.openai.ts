import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

// Specs reference: https://platform.openai.com/docs/models/gpt-5.2-codex (retrieved 2026-02-25)
const GPT_5_2_CodexLiteral = "gpt-5.2-codex";
const GPT_5_2_CodexDescription =
  "Coding-optimized GPT-5.2 Codex model for software engineering, debugging, and autonomous coding workflows.";

const GPT_5_2_CodexSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5_2_CodexLiteral,
  description: GPT_5_2_CodexDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(131072, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(131072, 4).schema,
  },
  price: pricingData[GPT_5_2_CodexLiteral],
});

const GPT_5_2_CodexOptions = BaseChatModelOptions;
type GPT_5_2_CodexOptionsType = z.infer<typeof GPT_5_2_CodexOptions>;

class GPT_5_2_Codex extends BaseChatModel {
  constructor(options: GPT_5_2_CodexOptionsType) {
    super(GPT_5_2_CodexSchema, options);
  }
}

export { GPT_5_2_Codex, GPT_5_2_CodexLiteral, GPT_5_2_CodexOptions, GPT_5_2_CodexSchema, type GPT_5_2_CodexOptionsType };

import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

// Specs reference: https://platform.openai.com/docs/models/gpt-5.3-codex (retrieved 2026-02-25)
const GPT_5_3_CodexLiteral = "gpt-5.3-codex";
const GPT_5_3_CodexDescription =
  "Latest coding-optimized GPT-5.3 Codex model for high-reliability code generation, edits, and agentic software tasks.";

const GPT_5_3_CodexSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: GPT_5_3_CodexLiteral,
  description: GPT_5_3_CodexDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 131072,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(131072, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(131072, 4).schema,
  },
  price: pricingData[GPT_5_3_CodexLiteral],
});

const GPT_5_3_CodexOptions = BaseChatModelOptions;
type GPT_5_3_CodexOptionsType = z.infer<typeof GPT_5_3_CodexOptions>;

class GPT_5_3_Codex extends BaseChatModel {
  constructor(options: GPT_5_3_CodexOptionsType) {
    super(GPT_5_3_CodexSchema, options);
  }
}

export { GPT_5_3_Codex, GPT_5_3_CodexLiteral, GPT_5_3_CodexOptions, GPT_5_3_CodexSchema, type GPT_5_3_CodexOptionsType };

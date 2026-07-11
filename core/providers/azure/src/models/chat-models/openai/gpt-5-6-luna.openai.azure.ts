import { z } from "zod";

import { GPT_5_6_LunaSchema as OpenAI_GPT_5_6_LunaSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const GPT_5_6_LunaLiteral = "gpt-5.6-luna" as const;
const GPT_5_6_LunaSchema = OpenAI_GPT_5_6_LunaSchema;
const GPT_5_6_LunaOptions = BaseChatModelOptions;
type GPT_5_6_LunaOptionsType = z.infer<typeof GPT_5_6_LunaOptions>;

class GPT_5_6_Luna extends BaseChatModelOpenAI {
  constructor(options: GPT_5_6_LunaOptionsType) {
    super(GPT_5_6_LunaSchema, options);
  }
}

export { GPT_5_6_Luna, GPT_5_6_LunaOptions, GPT_5_6_LunaSchema, GPT_5_6_LunaLiteral, type GPT_5_6_LunaOptionsType };

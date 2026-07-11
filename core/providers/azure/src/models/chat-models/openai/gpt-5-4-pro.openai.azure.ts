import { z } from "zod";

import { GPT_5_4_ProSchema as OpenAI_GPT_5_4_ProSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const GPT_5_4_ProLiteral = "gpt-5.4-pro" as const;
const GPT_5_4_ProSchema = OpenAI_GPT_5_4_ProSchema;
const GPT_5_4_ProOptions = BaseChatModelOptions;
type GPT_5_4_ProOptionsType = z.infer<typeof GPT_5_4_ProOptions>;

class GPT_5_4_Pro extends BaseChatModelOpenAI {
  constructor(options: GPT_5_4_ProOptionsType) {
    super(GPT_5_4_ProSchema, options);
  }
}

export { GPT_5_4_Pro, GPT_5_4_ProOptions, GPT_5_4_ProSchema, GPT_5_4_ProLiteral, type GPT_5_4_ProOptionsType };

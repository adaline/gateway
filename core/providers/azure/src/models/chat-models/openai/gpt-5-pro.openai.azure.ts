import { z } from "zod";

import { GPT_5_ProSchema as OpenAI_GPT_5_ProSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const GPT_5_ProLiteral = "gpt-5-pro" as const;
const GPT_5_ProSchema = OpenAI_GPT_5_ProSchema;
const GPT_5_ProOptions = BaseChatModelOptions;
type GPT_5_ProOptionsType = z.infer<typeof GPT_5_ProOptions>;

class GPT_5_Pro extends BaseChatModelOpenAI {
  constructor(options: GPT_5_ProOptionsType) {
    super(GPT_5_ProSchema, options);
  }
}

export { GPT_5_Pro, GPT_5_ProOptions, GPT_5_ProSchema, GPT_5_ProLiteral, type GPT_5_ProOptionsType };

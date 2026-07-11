import { z } from "zod";

import { GPT_5_6_SolSchema as OpenAI_GPT_5_6_SolSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const GPT_5_6_SolLiteral = "gpt-5.6-sol" as const;
const GPT_5_6_SolSchema = OpenAI_GPT_5_6_SolSchema;
const GPT_5_6_SolOptions = BaseChatModelOptions;
type GPT_5_6_SolOptionsType = z.infer<typeof GPT_5_6_SolOptions>;

class GPT_5_6_Sol extends BaseChatModelOpenAI {
  constructor(options: GPT_5_6_SolOptionsType) {
    super(GPT_5_6_SolSchema, options);
  }
}

export { GPT_5_6_Sol, GPT_5_6_SolOptions, GPT_5_6_SolSchema, GPT_5_6_SolLiteral, type GPT_5_6_SolOptionsType };

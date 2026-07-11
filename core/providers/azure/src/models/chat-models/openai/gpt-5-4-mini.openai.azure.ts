import { z } from "zod";

import { GPT_5_4_MiniSchema as OpenAI_GPT_5_4_MiniSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const GPT_5_4_MiniLiteral = "gpt-5.4-mini" as const;
const GPT_5_4_MiniSchema = OpenAI_GPT_5_4_MiniSchema;
const GPT_5_4_MiniOptions = BaseChatModelOptions;
type GPT_5_4_MiniOptionsType = z.infer<typeof GPT_5_4_MiniOptions>;

class GPT_5_4_Mini extends BaseChatModelOpenAI {
  constructor(options: GPT_5_4_MiniOptionsType) {
    super(GPT_5_4_MiniSchema, options);
  }
}

export { GPT_5_4_Mini, GPT_5_4_MiniOptions, GPT_5_4_MiniSchema, GPT_5_4_MiniLiteral, type GPT_5_4_MiniOptionsType };

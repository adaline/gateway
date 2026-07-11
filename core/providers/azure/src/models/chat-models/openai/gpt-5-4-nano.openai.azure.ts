import { z } from "zod";

import { GPT_5_4_NanoSchema as OpenAI_GPT_5_4_NanoSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const GPT_5_4_NanoLiteral = "gpt-5.4-nano" as const;
const GPT_5_4_NanoSchema = OpenAI_GPT_5_4_NanoSchema;
const GPT_5_4_NanoOptions = BaseChatModelOptions;
type GPT_5_4_NanoOptionsType = z.infer<typeof GPT_5_4_NanoOptions>;

class GPT_5_4_Nano extends BaseChatModelOpenAI {
  constructor(options: GPT_5_4_NanoOptionsType) {
    super(GPT_5_4_NanoSchema, options);
  }
}

export { GPT_5_4_Nano, GPT_5_4_NanoOptions, GPT_5_4_NanoSchema, GPT_5_4_NanoLiteral, type GPT_5_4_NanoOptionsType };

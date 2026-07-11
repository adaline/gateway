import { z } from "zod";

import { GPT_5_5Schema as OpenAI_GPT_5_5Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const GPT_5_5Literal = "gpt-5.5" as const;
const GPT_5_5Schema = OpenAI_GPT_5_5Schema;
const GPT_5_5Options = BaseChatModelOptions;
type GPT_5_5OptionsType = z.infer<typeof GPT_5_5Options>;

class GPT_5_5 extends BaseChatModelOpenAI {
  constructor(options: GPT_5_5OptionsType) {
    super(GPT_5_5Schema, options);
  }
}

export { GPT_5_5, GPT_5_5Options, GPT_5_5Schema, GPT_5_5Literal, type GPT_5_5OptionsType };

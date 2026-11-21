import { z } from "zod";

import { GPT_5Schema as OpenAI_GPT_5Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-11-20)
// Azure retirement: 2027-02-09.
const GPT_5Literal = "gpt-5" as const;
const GPT_5Schema = OpenAI_GPT_5Schema;
const GPT_5Options = BaseChatModelOptions;
type GPT_5OptionsType = z.infer<typeof GPT_5Options>;

class GPT_5 extends BaseChatModelOpenAI {
  constructor(options: GPT_5OptionsType) {
    super(GPT_5Schema, options);
  }
}

export { GPT_5, GPT_5Options, GPT_5Schema, GPT_5Literal, type GPT_5OptionsType };

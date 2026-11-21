import { z } from "zod";

import { GPT_5_2Schema as OpenAI_GPT_5_2Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-11-20)
// Azure retirement: 2027-06-08.
const GPT_5_2Literal = "gpt-5.2" as const;
const GPT_5_2Schema = OpenAI_GPT_5_2Schema;
const GPT_5_2Options = BaseChatModelOptions;
type GPT_5_2OptionsType = z.infer<typeof GPT_5_2Options>;

class GPT_5_2 extends BaseChatModelOpenAI {
  constructor(options: GPT_5_2OptionsType) {
    super(GPT_5_2Schema, options);
  }
}

export { GPT_5_2, GPT_5_2Options, GPT_5_2Schema, GPT_5_2Literal, type GPT_5_2OptionsType };

import { z } from "zod";

import { GPT_5_4Schema as OpenAI_GPT_5_4Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const GPT_5_4Literal = "gpt-5.4" as const;
const GPT_5_4Schema = OpenAI_GPT_5_4Schema;
const GPT_5_4Options = BaseChatModelOptions;
type GPT_5_4OptionsType = z.infer<typeof GPT_5_4Options>;

class GPT_5_4 extends BaseChatModelOpenAI {
  constructor(options: GPT_5_4OptionsType) {
    super(GPT_5_4Schema, options);
  }
}

export { GPT_5_4, GPT_5_4Options, GPT_5_4Schema, GPT_5_4Literal, type GPT_5_4OptionsType };

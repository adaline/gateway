import { z } from "zod";

import { GPT_4oSchema as OpenAI_GPT_4oSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-11-20)
// Azure retirement: 2027-04-14.
const GPT_4oLiteral = "gpt-4o" as const;
const GPT_4oSchema = OpenAI_GPT_4oSchema;
const GPT_4oOptions = BaseChatModelOptions;
type GPT_4oOptionsType = z.infer<typeof GPT_4oOptions>;

class GPT_4o extends BaseChatModelOpenAI {
  constructor(options: GPT_4oOptionsType) {
    super(GPT_4oSchema, options);
  }
}

export { GPT_4o, GPT_4oOptions, GPT_4oSchema, GPT_4oLiteral, type GPT_4oOptionsType };

import { z } from "zod";

import { GPT_5_6_TerraSchema as OpenAI_GPT_5_6_TerraSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const GPT_5_6_TerraLiteral = "gpt-5.6-terra" as const;
const GPT_5_6_TerraSchema = OpenAI_GPT_5_6_TerraSchema;
const GPT_5_6_TerraOptions = BaseChatModelOptions;
type GPT_5_6_TerraOptionsType = z.infer<typeof GPT_5_6_TerraOptions>;

class GPT_5_6_Terra extends BaseChatModelOpenAI {
  constructor(options: GPT_5_6_TerraOptionsType) {
    super(GPT_5_6_TerraSchema, options);
  }
}

export { GPT_5_6_Terra, GPT_5_6_TerraOptions, GPT_5_6_TerraSchema, GPT_5_6_TerraLiteral, type GPT_5_6_TerraOptionsType };

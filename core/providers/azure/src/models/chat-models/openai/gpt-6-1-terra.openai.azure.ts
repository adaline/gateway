import { z } from "zod";

import { GPT_6_1_TerraSchema as OpenAI_GPT_6_1_TerraSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-11-20)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-11-20)
// Azure retirement: 2027-10-26.
// Azure Global Standard pricing equals OpenAI's. Like the existing gpt-5.4-pro / gpt-5-pro wrappers, this
// wrapper does not set forceResponsesApi: the shared Azure base routes to the deployment's chat/completions URL.
const GPT_6_1_TerraLiteral = "gpt-6.1-terra" as const;
const GPT_6_1_TerraSchema = OpenAI_GPT_6_1_TerraSchema;
const GPT_6_1_TerraOptions = BaseChatModelOptions;
type GPT_6_1_TerraOptionsType = z.infer<typeof GPT_6_1_TerraOptions>;

class GPT_6_1_Terra extends BaseChatModelOpenAI {
  constructor(options: GPT_6_1_TerraOptionsType) {
    super(GPT_6_1_TerraSchema, options);
  }
}

export { GPT_6_1_Terra, GPT_6_1_TerraOptions, GPT_6_1_TerraSchema, GPT_6_1_TerraLiteral, type GPT_6_1_TerraOptionsType };

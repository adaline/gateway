import { z } from "zod";

import { GPT_6_AstraSchema as OpenAI_GPT_6_AstraSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-11-20)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-11-20)
// Azure retirement: 2028-01-11.
// Azure Global Standard pricing equals OpenAI's. Like the existing gpt-5.4-pro / gpt-5-pro wrappers, this
// wrapper does not set forceResponsesApi: the shared Azure base routes to the deployment's chat/completions URL.
const GPT_6_AstraLiteral = "gpt-6-astra" as const;
const GPT_6_AstraSchema = OpenAI_GPT_6_AstraSchema;
const GPT_6_AstraOptions = BaseChatModelOptions;
type GPT_6_AstraOptionsType = z.infer<typeof GPT_6_AstraOptions>;

class GPT_6_Astra extends BaseChatModelOpenAI {
  constructor(options: GPT_6_AstraOptionsType) {
    super(GPT_6_AstraSchema, options);
  }
}

export { GPT_6_Astra, GPT_6_AstraOptions, GPT_6_AstraSchema, GPT_6_AstraLiteral, type GPT_6_AstraOptionsType };

import { z } from "zod";

import { GPT_6_SolSchema as OpenAI_GPT_6_SolSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-11-20)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-11-20)
// Azure retirement: 2028-03-11.
// Azure Global Standard pricing equals OpenAI's. Like the existing gpt-5.4-pro / gpt-5-pro wrappers, this
// wrapper does not set forceResponsesApi: the shared Azure base routes to the deployment's chat/completions URL.
const GPT_6_SolLiteral = "gpt-6-sol" as const;
const GPT_6_SolSchema = OpenAI_GPT_6_SolSchema;
const GPT_6_SolOptions = BaseChatModelOptions;
type GPT_6_SolOptionsType = z.infer<typeof GPT_6_SolOptions>;

class GPT_6_Sol extends BaseChatModelOpenAI {
  constructor(options: GPT_6_SolOptionsType) {
    super(GPT_6_SolSchema, options);
  }
}

export { GPT_6_Sol, GPT_6_SolOptions, GPT_6_SolSchema, GPT_6_SolLiteral, type GPT_6_SolOptionsType };

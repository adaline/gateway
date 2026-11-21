import { z } from "zod";

import { GPT_6_LunaSchema as OpenAI_GPT_6_LunaSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-11-20)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-11-20)
// Azure retirement: 2028-03-11.
// Azure Global Standard pricing equals OpenAI's. Like the existing gpt-5.4-pro / gpt-5-pro wrappers, this
// wrapper does not set forceResponsesApi: the shared Azure base routes to the deployment's chat/completions URL.
const GPT_6_LunaLiteral = "gpt-6-luna" as const;
const GPT_6_LunaSchema = OpenAI_GPT_6_LunaSchema;
const GPT_6_LunaOptions = BaseChatModelOptions;
type GPT_6_LunaOptionsType = z.infer<typeof GPT_6_LunaOptions>;

class GPT_6_Luna extends BaseChatModelOpenAI {
  constructor(options: GPT_6_LunaOptionsType) {
    super(GPT_6_LunaSchema, options);
  }
}

export { GPT_6_Luna, GPT_6_LunaOptions, GPT_6_LunaSchema, GPT_6_LunaLiteral, type GPT_6_LunaOptionsType };

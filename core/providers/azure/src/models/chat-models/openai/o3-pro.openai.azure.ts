import { z } from "zod";

import { O3ProSchema as OpenAI_O3ProSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

// Specs reference: https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure (retrieved 2026-07-10)
// Retirement schedule: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule (retrieved 2026-07-10)
const O3ProLiteral = "o3-pro" as const;
const O3ProSchema = OpenAI_O3ProSchema;
const O3ProOptions = BaseChatModelOptions;
type O3ProOptionsType = z.infer<typeof O3ProOptions>;

class O3Pro extends BaseChatModelOpenAI {
  constructor(options: O3ProOptionsType) {
    super(O3ProSchema, options);
  }
}

export { O3Pro, O3ProOptions, O3ProSchema, O3ProLiteral, type O3ProOptionsType };

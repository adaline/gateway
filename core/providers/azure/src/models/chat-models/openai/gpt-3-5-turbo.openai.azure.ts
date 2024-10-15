import { z } from "zod";

import { GPT_3_5_TurboSchema as OpenAI_GPT_3_5_TurboSchema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const GPT_3_5_TurboLiteral = "gpt-3-5-turbo" as const;
const GPT_3_5_TurboSchema = OpenAI_GPT_3_5_TurboSchema;
const GPT_3_5_TurboOptions = BaseChatModelOptions;
type GPT_3_5_TurboOptionsType = z.infer<typeof GPT_3_5_TurboOptions>;

class GPT_3_5_Turbo extends BaseChatModelOpenAI {
  constructor(options: GPT_3_5_TurboOptionsType) {
    super(GPT_3_5_TurboSchema, options);
  }
}

export { GPT_3_5_Turbo, GPT_3_5_TurboOptions, GPT_3_5_TurboSchema, GPT_3_5_TurboLiteral, type GPT_3_5_TurboOptionsType };

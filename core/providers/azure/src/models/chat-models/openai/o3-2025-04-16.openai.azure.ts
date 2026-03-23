import { z } from "zod";

import { O3_2025_04_16Schema as OpenAI_O3_2025_04_16Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const O3_2025_04_16Literal = "o3-2025-04-16" as const;
const O3_2025_04_16Schema = OpenAI_O3_2025_04_16Schema;
const O3_2025_04_16Options = BaseChatModelOptions;
type O3_2025_04_16OptionsType = z.infer<typeof O3_2025_04_16Options>;

class O3_2025_04_16 extends BaseChatModelOpenAI {
  constructor(options: O3_2025_04_16OptionsType) {
    super(O3_2025_04_16Schema, options);
  }
}

export { O3_2025_04_16, O3_2025_04_16Options, O3_2025_04_16Schema, O3_2025_04_16Literal, type O3_2025_04_16OptionsType };

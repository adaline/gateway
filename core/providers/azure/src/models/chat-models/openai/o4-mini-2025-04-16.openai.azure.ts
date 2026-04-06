import { z } from "zod";

import { O4_Mini_2025_04_16Schema as OpenAI_O4_Mini_2025_04_16Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const O4_Mini_2025_04_16Literal = "o4-mini-2025-04-16" as const;
const O4_Mini_2025_04_16Schema = OpenAI_O4_Mini_2025_04_16Schema;
const O4_Mini_2025_04_16Options = BaseChatModelOptions;
type O4_Mini_2025_04_16OptionsType = z.infer<typeof O4_Mini_2025_04_16Options>;

class O4_Mini_2025_04_16 extends BaseChatModelOpenAI {
  constructor(options: O4_Mini_2025_04_16OptionsType) {
    super(O4_Mini_2025_04_16Schema, options);
  }
}

export {
  O4_Mini_2025_04_16,
  O4_Mini_2025_04_16Options,
  O4_Mini_2025_04_16Schema,
  O4_Mini_2025_04_16Literal,
  type O4_Mini_2025_04_16OptionsType,
};

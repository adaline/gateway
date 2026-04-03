import { z } from "zod";

import { O3Mini2025_01_31Schema as OpenAI_O3Mini2025_01_31Schema } from "@adaline/openai";

import { BaseChatModelOptions } from "../chat-model-options.azure";
import { BaseChatModelOpenAI } from "./base-chat-model.openai.azure";

const O3Mini2025_01_31Literal = "o3-mini-2025-01-31" as const;
const O3Mini2025_01_31Schema = OpenAI_O3Mini2025_01_31Schema;
const O3Mini2025_01_31Options = BaseChatModelOptions;
type O3Mini2025_01_31OptionsType = z.infer<typeof O3Mini2025_01_31Options>;

class O3Mini2025_01_31 extends BaseChatModelOpenAI {
  constructor(options: O3Mini2025_01_31OptionsType) {
    super(O3Mini2025_01_31Schema, options);
  }
}

export { O3Mini2025_01_31, O3Mini2025_01_31Options, O3Mini2025_01_31Schema, O3Mini2025_01_31Literal, type O3Mini2025_01_31OptionsType };

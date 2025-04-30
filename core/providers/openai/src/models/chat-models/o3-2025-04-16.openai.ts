import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModelOptions, BaseChatModel } from "./base-chat-model.openai";
import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const O3_2025_04_16Literal = "o3-2025-04-16";
const O3_2025_04_16Description =
  "A new standard for math, science, coding, and visual reasoning tasks. Training data up to Jun 2024.";

const O3_2025_04_16Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: O3_2025_04_16Literal,
  description: O3_2025_04_16Description,
  maxInputTokens: 200000,
  maxOutputTokens: 100000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(100000, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(100000, 4).schema,
  },
});

const O3_2025_04_16Options = BaseChatModelOptions;
type O3_2025_04_16OptionsType = z.infer<typeof O3_2025_04_16Options>;

class O3_2025_04_16 extends BaseChatModel {
  constructor(options: O3_2025_04_16OptionsType) {
    super(O3_2025_04_16Schema, options);
  }
}

export { O3_2025_04_16, O3_2025_04_16Literal, O3_2025_04_16Options, O3_2025_04_16Schema, type O3_2025_04_16OptionsType };

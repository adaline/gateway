import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModelOptions, BaseChatModel } from "./base-chat-model.openai";
import {
  OpenAIChatModelModalities,
  OpenAIChatModelModalitiesEnum,
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
} from "./types";

const O4_Mini_2025_04_16Literal = "o4-mini-2025-04-16";
const O4_Mini_2025_04_16Description =
  "Optimized for fast, effective reasoning with exceptionally efficient performance in coding and visual tasks. Training data up to Jun 2024.";

const O4_Mini_2025_04_16Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: O4_Mini_2025_04_16Literal,
  description: O4_Mini_2025_04_16Description,
  maxInputTokens: 200000,
  maxOutputTokens: 100000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(100000, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(100000, 4).schema,
  },
});

const O4_Mini_2025_04_16Options = BaseChatModelOptions;
type O4_Mini_2025_04_16OptionsType = z.infer<typeof O4_Mini_2025_04_16Options>;

class O4_Mini_2025_04_16 extends BaseChatModel {
  constructor(options: O4_Mini_2025_04_16OptionsType) {
    super(O4_Mini_2025_04_16Schema, options);
  }
}

export { O4_Mini_2025_04_16, O4_Mini_2025_04_16Literal, O4_Mini_2025_04_16Options, O4_Mini_2025_04_16Schema, type O4_Mini_2025_04_16OptionsType };


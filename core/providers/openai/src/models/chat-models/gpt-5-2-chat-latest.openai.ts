import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";
import { ImageModalityLiteral, TextModalityLiteral } from "@adaline/types";

import { OpenAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.openai";
import { OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

// Specs reference: https://platform.openai.com/docs/models/gpt-5.2 (retrieved 2025-12-12)
const GPT_5_2_ChatLatestLiteral = "gpt-5.2-chat-latest";
const GPT_5_2_ChatLatestDescription =
  "Latest GPT-5.2 model optimized for conversational use. Does not support function calling or structured outputs. \
  Training data up to August 2025.";

const GPT_5_2_ChatLatestModalities = [TextModalityLiteral, ImageModalityLiteral];
const GPT_5_2_ChatLatestModalitiesEnum = z.enum([TextModalityLiteral, ImageModalityLiteral]);

const GPT_5_2_ChatLatestSchema = ChatModelSchema(OpenAIChatModelRoles, GPT_5_2_ChatLatestModalitiesEnum).parse({
  name: GPT_5_2_ChatLatestLiteral,
  description: GPT_5_2_ChatLatestDescription,
  maxInputTokens: 400000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: GPT_5_2_ChatLatestModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5(128000, 4).def,
    schema: OpenAIChatModelConfigs.gpt5(128000, 4).schema,
  },
  price: pricingData[GPT_5_2_ChatLatestLiteral],
});

const GPT_5_2_ChatLatestOptions = BaseChatModelOptions;
type GPT_5_2_ChatLatestOptionsType = z.infer<typeof GPT_5_2_ChatLatestOptions>;

class GPT_5_2_ChatLatest extends BaseChatModel {
  constructor(options: GPT_5_2_ChatLatestOptionsType) {
    super(GPT_5_2_ChatLatestSchema, options);
  }
}

export { GPT_5_2_ChatLatest, GPT_5_2_ChatLatestLiteral, GPT_5_2_ChatLatestOptions, GPT_5_2_ChatLatestSchema, type GPT_5_2_ChatLatestOptionsType };

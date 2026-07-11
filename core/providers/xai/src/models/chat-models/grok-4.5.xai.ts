import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelRoles, XAIChatModelRolesMap, XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum } from "./types";

// spec-reference: https://docs.x.ai/docs/models, https://docs.x.ai/developers/models,
// https://docs.x.ai/docs/models/grok-4.5 (retrieved 2026-07-10)
// maxOutputTokens is not published by xAI docs; 131072 is carried from the grok-4.x family
// convention shared across the grok-4.x model family.
// Reasoning is always on for this model; xAI documents no reasoning_effort control for it
// (unlike grok-4.3), so the effort-less reasoning config is intentional.
const Grok_4_5_Literal = "grok-4.5";
const Grok_4_5_Description =
  "Grok-4.5 is xAI's most intelligent and fastest general-purpose model, recommended as the default for everything including code, with reasoning enabled and a 500K context window.";

const Grok_4_5_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_4_5_Literal,
  description: Grok_4_5_Description,
  maxInputTokens: 500000,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelReasoningConfigDef(131072),
    schema: XAIChatModelConfigs.ChatModelReasoningConfigSchema(131072),
  },
  price: pricingData[Grok_4_5_Literal],
});

const Grok_4_5_Options = BaseChatModelOptions;
type Grok_4_5_OptionsType = z.infer<typeof Grok_4_5_Options>;

class Grok_4_5 extends BaseChatModel {
  constructor(options: Grok_4_5_OptionsType) {
    super(Grok_4_5_Schema, options);
  }
}

export { Grok_4_5, Grok_4_5_Literal, Grok_4_5_Options, Grok_4_5_Schema, type Grok_4_5_OptionsType };

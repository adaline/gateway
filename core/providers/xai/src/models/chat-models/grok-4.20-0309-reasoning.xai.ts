import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelRoles, XAIChatModelRolesMap, XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum } from "./types";

// spec-reference: https://docs.x.ai/docs/models, https://docs.x.ai/developers/models,
// https://docs.x.ai/developers/models/grok-4.20 (retrieved 2026-07-10)
// maxOutputTokens is not published by xAI docs; 131072 is carried from the grok-4.x family
// convention shared across the grok-4.x model family.
const Grok_4_20_0309_Reasoning_Literal = "grok-4.20-0309-reasoning";
const Grok_4_20_0309_Reasoning_Description =
  "Grok-4.20 (0309) Reasoning is xAI's reasoning-enabled variant of the grok-4.20 family with a 1M-token context window.";

const Grok_4_20_0309_Reasoning_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_4_20_0309_Reasoning_Literal,
  description: Grok_4_20_0309_Reasoning_Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelReasoningConfigDef(131072),
    schema: XAIChatModelConfigs.ChatModelReasoningConfigSchema(131072),
  },
  price: pricingData[Grok_4_20_0309_Reasoning_Literal],
});

const Grok_4_20_0309_Reasoning_Options = BaseChatModelOptions;
type Grok_4_20_0309_Reasoning_OptionsType = z.infer<typeof Grok_4_20_0309_Reasoning_Options>;

class Grok_4_20_0309_Reasoning extends BaseChatModel {
  constructor(options: Grok_4_20_0309_Reasoning_OptionsType) {
    super(Grok_4_20_0309_Reasoning_Schema, options);
  }
}

export {
  Grok_4_20_0309_Reasoning,
  Grok_4_20_0309_Reasoning_Literal,
  Grok_4_20_0309_Reasoning_Options,
  Grok_4_20_0309_Reasoning_Schema,
  type Grok_4_20_0309_Reasoning_OptionsType,
};

import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelRoles, XAIChatModelRolesMap, XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum } from "./types";

// spec-reference: https://docs.x.ai/docs/models, https://docs.x.ai/developers/models
// (retrieved 2026-07-10)
// maxOutputTokens is not published by xAI docs; 131072 is carried from the grok-4.x family
// convention shared across the grok-4.x model family.
const Grok_4_20_0309_Non_Reasoning_Literal = "grok-4.20-0309-non-reasoning";
const Grok_4_20_0309_Non_Reasoning_Description =
  "Grok-4.20 (0309) Non-Reasoning is xAI's non-reasoning variant of the grok-4.20 family with a 1M-token context window.";

const Grok_4_20_0309_Non_Reasoning_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_4_20_0309_Non_Reasoning_Literal,
  description: Grok_4_20_0309_Non_Reasoning_Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelResponseSchemaConfigDef(131072, 4),
    schema: XAIChatModelConfigs.ChatModelResponseSchemaConfigSchema(131072, 4),
  },
  price: pricingData[Grok_4_20_0309_Non_Reasoning_Literal],
});

const Grok_4_20_0309_Non_Reasoning_Options = BaseChatModelOptions;
type Grok_4_20_0309_Non_Reasoning_OptionsType = z.infer<typeof Grok_4_20_0309_Non_Reasoning_Options>;

class Grok_4_20_0309_Non_Reasoning extends BaseChatModel {
  constructor(options: Grok_4_20_0309_Non_Reasoning_OptionsType) {
    super(Grok_4_20_0309_Non_Reasoning_Schema, options);
  }
}

export {
  Grok_4_20_0309_Non_Reasoning,
  Grok_4_20_0309_Non_Reasoning_Literal,
  Grok_4_20_0309_Non_Reasoning_Options,
  Grok_4_20_0309_Non_Reasoning_Schema,
  type Grok_4_20_0309_Non_Reasoning_OptionsType,
};

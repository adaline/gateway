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
const Grok_4_20_Multi_Agent_0309_Literal = "grok-4.20-multi-agent-0309";
const Grok_4_20_Multi_Agent_0309_Description =
  "Grok-4.20 Multi-Agent (0309) is xAI's multi-agent variant of the grok-4.20 family with reasoning enabled and a 1M-token context window.";

const Grok_4_20_Multi_Agent_0309_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_4_20_Multi_Agent_0309_Literal,
  description: Grok_4_20_Multi_Agent_0309_Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelReasoningConfigDef(131072),
    schema: XAIChatModelConfigs.ChatModelReasoningConfigSchema(131072),
  },
  price: pricingData[Grok_4_20_Multi_Agent_0309_Literal],
});

const Grok_4_20_Multi_Agent_0309_Options = BaseChatModelOptions;
type Grok_4_20_Multi_Agent_0309_OptionsType = z.infer<typeof Grok_4_20_Multi_Agent_0309_Options>;

class Grok_4_20_Multi_Agent_0309 extends BaseChatModel {
  constructor(options: Grok_4_20_Multi_Agent_0309_OptionsType) {
    super(Grok_4_20_Multi_Agent_0309_Schema, options);
  }
}

export {
  Grok_4_20_Multi_Agent_0309,
  Grok_4_20_Multi_Agent_0309_Literal,
  Grok_4_20_Multi_Agent_0309_Options,
  Grok_4_20_Multi_Agent_0309_Schema,
  type Grok_4_20_Multi_Agent_0309_OptionsType,
};

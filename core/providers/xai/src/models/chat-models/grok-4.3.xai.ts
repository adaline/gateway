import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelRoles, XAIChatModelRolesMap, XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum } from "./types";

// spec-reference: https://docs.x.ai/developers/models/grok-4.3, https://docs.x.ai/docs/models,
// https://docs.x.ai/developers/migration/may-15-retirement (retrieved 2026-07-10)
// maxOutputTokens is not published by xAI docs; 131072 is carried from the grok-4.x family
// convention shared across the grok-4.x model family.
// reasoning_effort is confirmed for values 'none' and 'low' only (via migration guidance);
// higher effort levels are unverified and intentionally omitted.
const Grok_4_3_Literal = "grok-4.3";
const Grok_4_3_Description =
  "Grok-4.3 is xAI's flagship model with a 1M-token context window, reasoning effort control, strong non-hallucination rate, and agentic tool calling. Primary migration target for retired grok-4 / grok-4.1-fast / grok-3 slugs.";

const Grok_4_3_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_4_3_Literal,
  description: Grok_4_3_Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelReasoningEffortConfigDef(131072),
    schema: XAIChatModelConfigs.ChatModelReasoningEffortConfigSchema(131072),
  },
  price: pricingData[Grok_4_3_Literal],
});

const Grok_4_3_Options = BaseChatModelOptions;
type Grok_4_3_OptionsType = z.infer<typeof Grok_4_3_Options>;

class Grok_4_3 extends BaseChatModel {
  constructor(options: Grok_4_3_OptionsType) {
    super(Grok_4_3_Schema, options);
  }
}

export { Grok_4_3, Grok_4_3_Literal, Grok_4_3_Options, Grok_4_3_Schema, type Grok_4_3_OptionsType };

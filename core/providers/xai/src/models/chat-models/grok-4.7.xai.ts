import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelRoles, XAIChatModelRolesMap, XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum } from "./types";

// spec-reference: https://docs.x.ai/developers/models, https://docs.x.ai/developers/models/grok-4.7,
// https://docs.x.ai/developers/release-notes (retrieved 2026-11-20)
// maxOutputTokens is not published by xAI docs; 131072 is carried from the grok-4.x family
// convention shared across the grok-4.x model family.
// Reasoning is always on for this model: xAI documents reasoning_effort as 'low' / 'medium' /
// 'high' / 'xhigh' with a 'high' default and states it cannot be disabled, so 'none' is not offered.
// See https://docs.x.ai/developers/model-capabilities/text/reasoning (retrieved 2026-11-20)
// Pricing has a long-context tier: once the prompt reaches 200K tokens, all tokens bill at the higher rate.
const Grok_4_7_Literal = "grok-4.7";
const Grok_4_7_Description =
  "xAI's most capable model and frontier model for coding, agentic tasks, and knowledge work, with reasoning always enabled and a 500K context window. Knowledge cutoff: May 2026.";

const Grok_4_7_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_4_7_Literal,
  description: Grok_4_7_Description,
  maxInputTokens: 500000,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelReasoningEffortLowMediumHighXhighConfigDef(131072),
    schema: XAIChatModelConfigs.ChatModelReasoningEffortLowMediumHighXhighConfigSchema(131072),
  },
  price: pricingData[Grok_4_7_Literal],
});

const Grok_4_7_Options = BaseChatModelOptions;
type Grok_4_7_OptionsType = z.infer<typeof Grok_4_7_Options>;

class Grok_4_7 extends BaseChatModel {
  constructor(options: Grok_4_7_OptionsType) {
    super(Grok_4_7_Schema, options);
  }
}

export { Grok_4_7, Grok_4_7_Literal, Grok_4_7_Options, Grok_4_7_Schema, type Grok_4_7_OptionsType };

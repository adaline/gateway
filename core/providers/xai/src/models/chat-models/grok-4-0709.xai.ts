import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum, XAIChatModelRoles, XAIChatModelRolesMap } from "./types";

const Grok_4_0709_Literal = "grok-4-0709";
const Grok_4_0709_Description =
  "Grok-4 version 0709 is a specific release of xAI's most advanced reasoning model with a 256K context window.";

const Grok_4_0709_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_4_0709_Literal,
  description: Grok_4_0709_Description,
  maxInputTokens: 262144,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelReasoningConfigDef(131072),
    schema: XAIChatModelConfigs.ChatModelReasoningConfigSchema(131072),
  },
  price: pricingData[Grok_4_0709_Literal],
});

const Grok_4_0709_Options = BaseChatModelOptions;
type Grok_4_0709_OptionsType = z.infer<typeof Grok_4_0709_Options>;

class Grok_4_0709 extends BaseChatModel {
  constructor(options: Grok_4_0709_OptionsType) {
    super(Grok_4_0709_Schema, options);
  }
}

export { Grok_4_0709, Grok_4_0709_Literal, Grok_4_0709_Options, Grok_4_0709_Schema, type Grok_4_0709_OptionsType };

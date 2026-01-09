import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum, XAIChatModelRoles, XAIChatModelRolesMap } from "./types";

const Grok_4_Literal = "grok-4";
const Grok_4_Description =
  "Grok-4 is xAI's most advanced reasoning model with a 256K context window.";

const Grok_4_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_4_Literal,
  description: Grok_4_Description,
  maxInputTokens: 262144,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelReasoningConfigDef(131072),
    schema: XAIChatModelConfigs.ChatModelReasoningConfigSchema(131072),
  },
  price: pricingData[Grok_4_Literal],
});

const Grok_4_Options = BaseChatModelOptions;
type Grok_4_OptionsType = z.infer<typeof Grok_4_Options>;

class Grok_4 extends BaseChatModel {
  constructor(options: Grok_4_OptionsType) {
    super(Grok_4_Schema, options);
  }
}

export { Grok_4, Grok_4_Literal, Grok_4_Options, Grok_4_Schema, type Grok_4_OptionsType };
